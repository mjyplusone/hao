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
