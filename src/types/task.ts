export interface Task {
  id: string;
  name: string;
  type: "upload" | "download";
  status: "pending" | "completed" | "failed" | "paused";
  progress: number;
  size: number;
  date: string;
  uploadFile?: Pick<Taro.chooseMedia.ChooseMedia, "tempFilePath">;
  downloadFile?: {
    tempFilePath: string;
  };
}

export interface ProgressInfo
  extends Omit<Task, "status" | "progress" | "date"> {
  completedChunks: number;
  totalChunks: number;
  lastUpdateTime: number;
}
