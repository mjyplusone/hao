import { ProgressInfo } from "@/types";
import Taro from "@tarojs/taro";
import { PROGRESS_STORAGE_KEY } from "@/const";

// 本地存储管理
export const ProgressStorage = {
  // 保存进度信息
  saveProgress: (progress: ProgressInfo) => {
    try {
      const allProgress = ProgressStorage.getAllProgress();
      const existingIndex = allProgress.findIndex((p) => p.id === progress.id);

      if (existingIndex >= 0) {
        allProgress[existingIndex] = progress;
      } else {
        allProgress.push(progress);
      }

      Taro.setStorageSync(PROGRESS_STORAGE_KEY, allProgress);
    } catch (error) {
      console.error("保存进度失败:", error);
    }
  },

  // 获取指定任务的进度
  getProgress: (id: string): ProgressInfo | null => {
    try {
      const allProgress = ProgressStorage.getAllProgress();
      return allProgress.find((p) => p.id === id) || null;
    } catch (error) {
      console.error("获取进度失败:", error);
      return null;
    }
  },

  // 获取所有进度信息
  getAllProgress: (): ProgressInfo[] => {
    try {
      return Taro.getStorageSync(PROGRESS_STORAGE_KEY) || [];
    } catch (error) {
      console.error("获取所有进度失败:", error);
      return [];
    }
  },

  // 获取所有未完成的任务
  getAllUnfinishedProgress: (): ProgressInfo[] => {
    try {
      const allProgress = ProgressStorage.getAllProgress();
      return allProgress.filter((progress) => {
        // 过滤掉已完成的任务（completedChunks === totalChunks）
        return progress.completedChunks < progress.totalChunks;
      });
    } catch (error) {
      console.error("获取所有未完成的任务失败:", error);
      return [];
    }
  },

  // 更新进度
  updateProgress: (id: string, updates: Partial<ProgressInfo>) => {
    try {
      const allProgress = ProgressStorage.getAllProgress();
      const progressIndex = allProgress.findIndex((p) => p.id === id);

      if (progressIndex >= 0) {
        allProgress[progressIndex] = {
          ...allProgress[progressIndex],
          ...updates,
          lastUpdateTime: Date.now(),
        };
        Taro.setStorageSync(PROGRESS_STORAGE_KEY, allProgress);
      }
    } catch (error) {
      console.error("更新进度失败:", error);
    }
  },

  // 删除进度信息
  removeProgress: (id: string) => {
    try {
      const allProgress = ProgressStorage.getAllProgress();
      const filteredProgress = allProgress.filter((p) => p.id !== id);
      Taro.setStorageSync(PROGRESS_STORAGE_KEY, filteredProgress);
    } catch (error) {
      console.error("删除进度失败:", error);
    }
  },

  // 清理过期的进度信息（超过24小时）
  cleanupExpiredProgress: () => {
    try {
      const allProgress = ProgressStorage.getAllProgress();
      const now = Date.now();
      const validProgress = allProgress.filter(
        (p) => now - p.lastUpdateTime < 24 * 60 * 60 * 1000
      );

      if (validProgress.length !== allProgress.length) {
        Taro.setStorageSync(PROGRESS_STORAGE_KEY, validProgress);
      }
    } catch (error) {
      console.error("清理过期进度失败:", error);
    }
  },
};
