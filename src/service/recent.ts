import { Photo, GrowthRecord, Say } from "@/types";
import { get } from "@/utils/request";
import haoImg from "@/assets/hao.jpg";

export const getRecentInfo = async (): Promise<{
  photos: Photo[];
  growthRecord: GrowthRecord;
  says: Say[];
}> => {
  return {
    photos: [
      { id: 1, src: haoImg, date: "2024-12-01", description: "小好的可爱瞬间" },
      { id: 2, src: haoImg, date: "2024-11-28", description: "第一次翻身" },
      { id: 3, src: haoImg, date: "2024-11-25", description: "甜甜的笑容" },
    ],
    growthRecord: {
      id: 1,
      date: "2024-12-01",
      height: 65,
      weight: 7.2,
    },
    says: [
      {
        id: 1,
        content: "小好，今天你笑了好多次，妈妈很开心！",
        date: "2024-12-01",
        username: "妈妈",
      },
      {
        id: 2,
        content: "希望你快快长大，健康快乐每一天",
        date: "2024-11-28",
        username: "爸爸",
      },
      {
        id: 3,
        content: "今天学会了翻身，真棒！",
        date: "2024-11-25",
        username: "奶奶",
      },
    ],
  };
  const response = await get("/recent");
  return response.data;
};
