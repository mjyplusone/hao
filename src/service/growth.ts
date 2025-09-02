import { GrowthRecord } from "@/types";
import { get } from "@/utils/request";

export const getGrowthRecordList = async (): Promise<GrowthRecord[]> => {
  return [
    {
      id: 1,
      date: "2024-12-01",
      height: 65,
      weight: 7.2,
    },
    {
      id: 2,
      date: "2024-12-02",
      height: 66,
      weight: 7.3,
    },
    {
      id: 3,
      date: "2024-12-03",
      height: 67,
      weight: 7.4,
    },
    {
      id: 4,
      date: "2024-12-04",
      height: 68,
      weight: 7.5,
    },
  ];
  const response = await get("/growth");
  return response.data;
};

export const addGrowthRecord = async (
  data: Omit<GrowthRecord, "id" | "date">
): Promise<GrowthRecord> => {
  // 模拟API调用
  return {
    id: Date.now(),
    date: new Date().toISOString().split("T")[0],
    ...data,
  };
  // 实际API调用
  // const response = await post("/growth", data);
  // return response.data;
};
