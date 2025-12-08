import { Photo, Say } from "@/types";
import { get } from "@/utils/request";

export const getRecentPhotos = async (): Promise<Photo[]> => {
  const res = await get<{ items: Photo[]; total: number }>(`/files`, {
    page: 1,
    size: 5,
  });
  return res.items;
};

export const getRecentSays = async (): Promise<Say[]> => {
  const response = await get("/comments", {
    page: 1,
    size: 3,
  });
  return response.items;
};
