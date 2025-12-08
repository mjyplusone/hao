import { Say } from "@/types";
import { get, post, put } from "@/utils/request";

export const getSayList = async (): Promise<Say[]> => {
  const response = await get("/comments", {
    page: 1,
    size: 30,
  });
  return response.items;
};

export const createSay = async (params: { content: string }) => {
  const response = await post("/comments", params);
  return response.data;
};

export const updateSay = async (params: { id: number; content: string }) => {
  const response = await put(`/comment/${params.id}`, {
    content: params.content,
  });
  return response.data;
};
