import { Say } from "@/types";
import { get, post } from "@/utils/request";

export const getSayList = async (): Promise<Say[]> => {
  return [];
  return [
    {
      id: 1,
      content: "小好，今天你笑了好多次，妈妈很开心！",
      date: "2024-12-01",
      username: "妈妈",
    },
    {
      id: 2,
      content: "希望你快快长大，健康快乐每一天",
      date: "2024-12-02",
      username: "爸爸",
    },
    {
      id: 3,
      content: "今天学会了翻身，真棒！",
      date: "2024-12-03",
      username: "奶奶",
    },
    {
      id: 4,
      content: "今天学会了翻身，真棒！",
      date: "2024-12-04",
      username: "爷爷",
    },
    {
      id: 5,
      content: "今天学会了翻身，真棒！",
      date: "2024-12-05",
      username: "外公",
    },
  ];
  const response = await get("/say");
  return response.data;
};

export const createSay = async (data: Say) => {
  const response = await post("/say", data);
  return response.data;
};
