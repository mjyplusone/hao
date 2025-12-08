import { post } from "@/utils/request";

export const initUpload = async (params: {
  filename: string;
  size: number;
  totalChunks: number;
}): Promise<{ session_id: number; folder: string; filename: string }> => {
  const response = await post("/initupload", {
    total_size: params.size,
    ext: params.filename.split(".").pop(),
  });
  return response;
};

export const getFileSize = async (params: {
  fileId: number;
}): Promise<{ id: number; size: number }> => {
  return { id: params.fileId, size: 10485760 };
  const response = await post("/transfer/getFileSize", params);
  return response.data;
};
