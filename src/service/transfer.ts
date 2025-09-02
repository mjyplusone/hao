import { post } from "@/utils/request";

export const initUpload = async (params: {
  filename: string;
  size: number;
  totalChunks: number;
}): Promise<{ id: string }> => {
  return {
    id: Math.random().toString(36).substring(2, 15),
  };
  const response = await post("/transfer/initUpload", params);
  return response.data;
};

export const getFileSize = async (params: {
  fileId: number;
}): Promise<{ id: number; size: number }> => {
  return { id: params.fileId, size: 10485760 };
  const response = await post("/transfer/getFileSize", params);
  return response.data;
};
