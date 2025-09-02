import Taro from "@tarojs/taro";
import { create } from "zustand";
import { Task } from "@/types/task";
import { getFileSize, initUpload } from "@/service";
import { buildMultipartFormData, generateDateWithHash } from "@/utils/upload";
import { ProgressStorage } from "@/utils/progressStorage";
import { omit, uniqBy } from "lodash-es";

interface TransferStore {
  tasks: Task[];
  upload: (files: Taro.chooseMedia.ChooseMedia[]) => Promise<void>;
  initUpload: (
    file: Taro.chooseMedia.ChooseMedia
  ) => Promise<Omit<Task, "date">>;
  uploadFileByChunk: (task: Omit<Task, "date">) => Promise<void>;
  download: (fileIds: number[]) => Promise<void>;
  initDownload: (fileId: number) => Promise<Omit<Task, "date">>;
  downloadFileByRange: (task: Omit<Task, "date">) => Promise<void>;
  addTasks: (tasks: Omit<Task, "date">[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  // 新增断点续传功能
  pauseTask: (id: string) => void;
  resumeTask: (id: string) => void;
  resumeAllUnfinishedTasks: () => Promise<void>;
  clearTempFiles: () => void;
  removeTask: (id: string) => void;
}

const CHUNK_SIZE = 2 * 1024 * 1024; // 每个分片大小，2MB
const TEMP_DIR = `${Taro.env.USER_DATA_PATH}/temp`; // 临时文件目录

export const useTransferStore = create<TransferStore>((set, get) => ({
  tasks: [],

  upload: async (files: Taro.chooseMedia.ChooseMedia[]) => {
    try {
      const tasks = await Promise.all(
        files.map((file) => get().initUpload(file))
      );
      get().addTasks(tasks);
      for (let i = 0; i < files.length; i++) {
        await get().uploadFileByChunk(tasks[i]);
      }
    } catch (error) {
      console.error(error);
    }
  },

  initUpload: async (file: Taro.chooseMedia.ChooseMedia) => {
    let uploadId = "";
    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const filename =
        file.tempFilePath.split("/").pop() ||
        `${generateDateWithHash()}${
          file.fileType === "video" ? ".mp4" : ".jpg"
        }`;
      const { id } = await initUpload({
        filename,
        size: file.size,
        totalChunks: totalChunks,
      });
      uploadId = id;

      const task: Omit<Task, "date"> = {
        id: uploadId,
        name: filename,
        type: "upload",
        status: "pending",
        progress: 0,
        size: file.size,
        uploadFile: {
          tempFilePath: file.tempFilePath,
        },
      };

      // 初始化进度信息
      ProgressStorage.saveProgress({
        ...omit(task, ["status", "progress"]),
        completedChunks: 0,
        totalChunks,
        lastUpdateTime: Date.now(),
      });

      return task;
    } catch (error) {
      console.error(error);
      get().updateTask(uploadId, {
        status: "failed",
      });
      return {
        id: "",
        name: "",
        type: "upload",
        status: "failed",
        progress: 0,
        size: 0,
        uploadFile: {
          tempFilePath: "",
        },
      };
    }
  },

  uploadFileByChunk: async (task: Omit<Task, "date">) => {
    const { id, name, size, uploadFile } = task;
    try {
      const fs = Taro.getFileSystemManager();

      // 从本地存储获取进度信息
      const progressInfo = ProgressStorage.getProgress(id);

      // 从上次中断的地方继续或从头开始
      const startChunk = progressInfo?.completedChunks ?? 0;
      const totalChunks = Math.ceil(size / CHUNK_SIZE);

      for (let i = startChunk; i < totalChunks; i++) {
        // 每次上传新 chunk 前检查任务是否被暂停
        const currentTask = get().tasks.find((t) => t.id === id);
        if (currentTask?.status === "paused") {
          break;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(size, start + CHUNK_SIZE);

        const chunkBuffer = await new Promise<ArrayBuffer>((res, rej) =>
          fs.readFile({
            filePath: uploadFile?.tempFilePath || "",
            position: start,
            length: end - start,
            success: (r) => res(r.data as ArrayBuffer),
            fail: rej,
          })
        );

        const { buffer, contentType } = buildMultipartFormData(
          chunkBuffer,
          {
            uploadId: id,
            filename: name,
            totalChunks,
            chunkIndex: i,
          },
          name
        );

        // TODO REMOVE MOCK
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 3000);
        });
        // 使用 Taro.request 上传
        // await Taro.request({
        //   url: "https://your-server.com/upload-chunk",
        //   method: "POST",
        //   header: {
        //     "Content-Type": contentType,
        //   },
        //   data: buffer,
        //   dataType: "other", // 不转 JSON
        //   responseType: "text",
        // });

        // 更新进度
        const newProgress = Math.floor((100 / totalChunks) * (i + 1));
        get().updateTask(id, {
          progress: newProgress,
        });

        // 保存进度到本地存储
        ProgressStorage.updateProgress(id, {
          completedChunks: i + 1,
        });
      }

      const currentTask = get().tasks.find((t) => t.id === id);
      if (currentTask?.status !== "paused") {
        get().updateTask(id, {
          status: "completed",
          progress: 100,
        });

        // 清理进度信息
        ProgressStorage.removeProgress(id);
      }
    } catch (error) {
      console.error(error);
      get().updateTask(id, {
        status: "failed",
      });

      // 清理进度信息
      ProgressStorage.removeProgress(id);
    }
  },

  download: async (fileIds: number[]) => {
    try {
      const tasks = await Promise.all(
        fileIds.map((fileId) => get().initDownload(fileId))
      );
      get().addTasks(tasks);
      for (let i = 0; i < fileIds.length; i++) {
        await get().downloadFileByRange(tasks[i]);
      }
    } catch (error) {
      console.error(error);
    }
  },

  initDownload: async (fileId: number) => {
    try {
      const { size: fileSize } = await getFileSize({ fileId });

      const tempFilePath = `${TEMP_DIR}/${fileId}_${Date.now()}.tmp`;

      const task: Omit<Task, "date"> = {
        id: fileId.toString(),
        name: fileId.toString(),
        type: "download",
        status: "pending",
        progress: 0,
        size: fileSize,
        downloadFile: {
          tempFilePath,
        },
      };

      ProgressStorage.saveProgress({
        ...omit(task, ["status", "progress"]),
        completedChunks: 0,
        totalChunks: Math.ceil(fileSize / CHUNK_SIZE),
        lastUpdateTime: Date.now(),
      });

      return task;
    } catch (error) {
      console.error(error);
      get().updateTask(fileId.toString(), {
        status: "failed",
      });
      return {
        id: "",
        name: "",
        type: "download",
        status: "failed",
        progress: 0,
        size: 0,
        downloadFile: {
          tempFilePath: "",
        },
      };
    }
  },

  downloadFileByRange: async (task: Omit<Task, "date">) => {
    const { id, size, downloadFile } = task;
    try {
      const fs = Taro.getFileSystemManager();
      // 确保临时目录存在
      try {
        fs.accessSync(TEMP_DIR);
      } catch {
        fs.mkdirSync(TEMP_DIR, true);
      }

      const totalChunks = Math.ceil(size / CHUNK_SIZE);

      // 从本地存储获取进度信息
      const progressInfo = ProgressStorage.getProgress(id);
      // 从上次中断的地方继续或从头开始
      const startChunk = progressInfo?.completedChunks ?? 0;

      for (let i = startChunk; i < totalChunks; i++) {
        // 检查任务是否被暂停
        const currentTask = get().tasks.find((t) => t.id === id);
        if (currentTask?.status === "paused") {
          break;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(size - 1, start + CHUNK_SIZE - 1);

        await new Promise((resolve, reject) => {
          Taro.request({
            url: `https://your-server.com/${id}/download-range`,
            header: { Range: `bytes=${start}-${end}` },
            responseType: "arraybuffer",
            success: (res) => {
              fs.appendFile({
                filePath: downloadFile?.tempFilePath || "",
                data: res.data,
                encoding: "binary",
                success: resolve,
                fail: reject,
              });
            },
            fail: reject,
          });
        });

        // 更新进度
        get().updateTask(id, {
          progress: Math.floor((100 / totalChunks) * (i + 1)),
        });

        // 保存进度到本地存储
        ProgressStorage.updateProgress(id, {
          completedChunks: i + 1,
        });
      }

      const currentTask = get().tasks.find((t) => t.id === id);
      if (currentTask?.status !== "paused") {
        // 下载完成，保存到相册并清理临时文件
        try {
          if (downloadFile?.tempFilePath.endsWith(".mp4")) {
            await Taro.saveVideoToPhotosAlbum({
              filePath: downloadFile?.tempFilePath || "",
            });
          } else {
            await Taro.saveImageToPhotosAlbum({
              filePath: downloadFile?.tempFilePath || "",
            });
          }

          // 清理临时文件
          fs.unlinkSync(downloadFile?.tempFilePath || "");

          get().updateTask(id, {
            status: "completed",
            progress: 100,
          });

          // 清理进度信息
          ProgressStorage.removeProgress(id);
        } catch (error) {
          console.error("保存文件失败:", error);

          // 清理临时文件
          fs.unlinkSync(downloadFile?.tempFilePath || "");

          get().updateTask(id, {
            status: "failed",
          });

          // 清理进度信息
          ProgressStorage.removeProgress(id);
        }
      }
    } catch (error) {
      console.error(error);
      get().updateTask(id, {
        status: "failed",
      });
      // 清理进度信息
      ProgressStorage.removeProgress(id);
    }
  },

  addTasks: (tasks: Omit<Task, "date">[]) => {
    const newTasks: Task[] = tasks.map((task) => ({
      ...task,
      date: new Date().toLocaleString("zh-CN"),
    }));
    set((state) => ({
      tasks: uniqBy([...state.tasks, ...newTasks], "id"),
    }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },

  pauseTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: "paused" } : task
      ),
    }));
  },

  resumeTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: "pending" } : task
      ),
    }));

    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.type === "upload") {
      // 恢复上传任务
      get().uploadFileByChunk(task);
    } else if (task.type === "download") {
      // 恢复下载任务
      get().downloadFileByRange(task);
    }
  },

  resumeAllUnfinishedTasks: async () => {
    const unfinishedTasks = ProgressStorage.getAllUnfinishedProgress();

    if (unfinishedTasks.length > 0) {
      Taro.showToast({
        title: `发现 ${unfinishedTasks.length} 个未完成任务，正在恢复...`,
        icon: "none",
        duration: 3000,
      });
    }

    get().addTasks(
      unfinishedTasks.map((task) => ({
        ...task,
        date: new Date().toLocaleString("zh-CN"),
        status: "pending",
        progress: 0,
      }))
    );

    for (const task of unfinishedTasks) {
      await get().resumeTask(task.id);
    }
  },

  clearTempFiles: () => {
    try {
      const fs = Taro.getFileSystemManager();
      // 清理所有临时文件
      const tempFiles = fs.readdirSync(TEMP_DIR);
      tempFiles.forEach((file) => {
        try {
          fs.unlinkSync(`${TEMP_DIR}/${file}`);
        } catch (error) {
          console.error(`删除临时文件失败: ${file}`, error);
        }
      });
      // 删除临时目录
      fs.rmdirSync(TEMP_DIR);
    } catch (error) {
      console.error("清理临时文件失败:", error);
    }
  },

  removeTask: (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task && task.downloadFile?.tempFilePath) {
      try {
        const fs = Taro.getFileSystemManager();
        fs.unlinkSync(task.downloadFile.tempFilePath);
      } catch (error) {
        console.error("删除临时文件失败:", error);
      }
    }

    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));

    // 清理进度信息
    ProgressStorage.removeProgress(id);
  },
}));

// 应用启动时清理过期的进度信息
ProgressStorage.cleanupExpiredProgress();
