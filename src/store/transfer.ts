import Taro from "@tarojs/taro";
import { create } from "zustand";
import { Task } from "@/types/task";
import { initUpload } from "@/service";
import {
  buildMultipartFormData,
  generateDateWithHash,
  getFileExtension,
} from "@/utils/upload";
import { ProgressStorage } from "@/utils/progressStorage";
import { omit, uniqBy } from "lodash-es";
import { BASE_URL } from "@/utils/request";

interface TransferStore {
  tasks: Task[];
  upload: (files: Taro.chooseMedia.ChooseMedia[]) => Promise<void>;
  initUpload: (
    file: Taro.chooseMedia.ChooseMedia
  ) => Promise<Omit<Task, "date">>;
  uploadFileByChunk: (task: Omit<Task, "date">) => Promise<void>;
  download: (
    files: { id: number; size: number; name?: string }[]
  ) => Promise<void>;
  initDownload: (file: {
    id: number;
    size: number;
    name?: string;
  }) => Promise<Omit<Task, "date">>;
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

const UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024; // 每个分片大小，2MB
const DOWNLOAD_CHUNK_SIZE = (1024 * 1024) / 4; // 每个分片大小，1MB
const TEMP_DIR = `${Taro.env.USER_DATA_PATH}/temp`; // 临时文件目录

export const useTransferStore = create<TransferStore>((set, get) => ({
  tasks: [],

  upload: async (files: Taro.chooseMedia.ChooseMedia[]) => {
    try {
      const tasks: Omit<Task, "date">[] = [];
      for (const file of files) {
        const task = await get().initUpload(file);
        tasks.push(task);
        get().addTasks([task]);
      }
      for (let i = 0; i < files.length; i++) {
        await get().uploadFileByChunk(tasks[i]);
      }
    } catch (error) {
      console.error(error);
    }
  },

  initUpload: async (file: Taro.chooseMedia.ChooseMedia) => {
    console.log(file);
    let uploadId = "";
    try {
      const totalChunks = Math.ceil(file.size / UPLOAD_CHUNK_SIZE);
      const originalFilename =
        file.tempFilePath.split("/").pop() ||
        `${generateDateWithHash()}${
          file.fileType === "video" ? ".mp4" : ".jpg"
        }`;
      const { session_id, filename } = await initUpload({
        filename: originalFilename,
        size: file.size,
        totalChunks: totalChunks,
      });
      uploadId = session_id.toString();

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
      const totalChunks = Math.ceil(size / UPLOAD_CHUNK_SIZE);

      for (let i = startChunk; i < totalChunks; i++) {
        // 每次上传新 chunk 前检查任务是否被暂停
        const currentTask = get().tasks.find((t) => t.id === id);
        if (currentTask?.status === "paused") {
          break;
        }

        const start = i * UPLOAD_CHUNK_SIZE;
        const end = Math.min(size, start + UPLOAD_CHUNK_SIZE);

        const chunkBuffer = await new Promise<ArrayBuffer>((res, rej) =>
          fs.readFile({
            filePath: uploadFile?.tempFilePath || "",
            position: start,
            length: end - start,
            success: (r) => res(r.data as ArrayBuffer),
            fail: rej,
          })
        );
        console.log("chunkBuffer", chunkBuffer);

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
        console.log(contentType, buffer);

        // 使用 Taro.request 上传
        await Taro.request({
          url: `${BASE_URL}/upload/${id}/${i}`,
          method: "POST",
          header: {
            "Content-Type": contentType,
            Authorization: `${Taro.getStorageSync("accessToken")}`,
          },
          data: buffer,
          dataType: "other", // 不转 JSON
          responseType: "text",
        });

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

  download: async (files: { id: number; size: number }[]) => {
    try {
      const tasks = await Promise.all(
        files.map((file) => get().initDownload(file))
      );
      get().addTasks(tasks);
      for (let i = 0; i < files.length; i++) {
        await get().downloadFileByRange(tasks[i]);
      }
    } catch (error) {
      console.error(error);
    }
  },

  initDownload: async (file: { id: number; size: number; name?: string }) => {
    try {
      const extension = getFileExtension(file.name);
      const tempFilePath = `${TEMP_DIR}/${file.id}_${Date.now()}${extension}`;

      const task: Omit<Task, "date"> = {
        id: file.id.toString(),
        name: file.id.toString(),
        type: "download",
        status: "pending",
        progress: 0,
        size: file.size,
        downloadFile: {
          tempFilePath,
        },
      };

      ProgressStorage.saveProgress({
        ...omit(task, ["status", "progress"]),
        completedChunks: 0,
        totalChunks: Math.ceil(file.size / DOWNLOAD_CHUNK_SIZE),
        lastUpdateTime: Date.now(),
      });

      return task;
    } catch (error) {
      console.error(error);
      get().updateTask(file.id.toString(), {
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

      const totalChunks = Math.ceil(size / DOWNLOAD_CHUNK_SIZE);

      // 从本地存储获取进度信息
      const progressInfo = ProgressStorage.getProgress(id);
      // 从上次中断的地方继续或从头开始
      const startChunk = progressInfo?.completedChunks ?? 0;

      const filePath = downloadFile?.tempFilePath || "";
      // 检查文件是否已存在
      let fileExists = false;
      try {
        fs.accessSync(filePath);
        fileExists = true;
      } catch {
        fileExists = false;
      }

      // 如果断点续传但文件不存在，重置为从头开始
      let actualStartChunk = startChunk;
      if (startChunk > 0 && !fileExists) {
        actualStartChunk = 0;
        // 重置进度信息
        ProgressStorage.updateProgress(id, {
          completedChunks: 0,
        });
      }

      for (let i = actualStartChunk; i < totalChunks; i++) {
        // 检查任务是否被暂停
        const currentTask = get().tasks.find((t) => t.id === id);
        if (currentTask?.status === "paused") {
          break;
        }

        const start = i * DOWNLOAD_CHUNK_SIZE;
        const end = Math.min(size - 1, start + DOWNLOAD_CHUNK_SIZE - 1);

        await new Promise((resolve, reject) => {
          Taro.request({
            url: `${BASE_URL}/file/${id}`,
            header: {
              Range: `bytes=${start}-${end}`,
              Authorization: `${Taro.getStorageSync("accessToken")}`,
            },
            responseType: "arraybuffer",
            success: (res) => {
              // 如果是第一个 chunk 且文件不存在，使用 writeFile 创建文件
              // 否则使用 appendFile 追加数据
              const isFirstChunk = i === actualStartChunk && !fileExists;

              if (isFirstChunk) {
                fs.writeFile({
                  filePath,
                  data: res.data,
                  encoding: "binary",
                  success: resolve,
                  fail: reject,
                });
              } else {
                fs.appendFile({
                  filePath,
                  data: res.data,
                  encoding: "binary",
                  success: resolve,
                  fail: reject,
                });
              }
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
          const filePath = downloadFile?.tempFilePath || "";
          // 根据文件扩展名判断是视频还是图片
          const isVideo = /\.(mp4|mov|avi)$/i.test(filePath);

          // 确保权限
          const setting = await Taro.getSetting();
          if (!setting.authSetting["scope.writePhotosAlbum"]) {
            try {
              await Taro.authorize({ scope: "scope.writePhotosAlbum" });
              console.log("授权成功");
            } catch {
              Taro.openSetting();
              console.log("授权失败");
              return;
            }
          }

          if (isVideo) {
            await Taro.saveVideoToPhotosAlbum({
              filePath,
            });
          } else {
            await Taro.saveImageToPhotosAlbum({
              filePath,
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
