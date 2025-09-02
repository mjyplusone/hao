import { Photo, PhotoFolder, ViewMode } from "@/types";
import { get } from "@/utils/request";
import haoImg from "@/assets/hao.jpg";

export const getPhotoFolders = async (params: {
  viewMode: ViewMode;
}): Promise<PhotoFolder[]> => {
  if (params.viewMode === "all") {
    return [
      {
        id: 1,
        yearMonth: "2024-12",
        photoCount: 10,
      },
      {
        id: 2,
        yearMonth: "2024-11",
        photoCount: 10,
      },
      {
        id: 3,
        yearMonth: "2024-10",
        photoCount: 10,
      },
      {
        id: 4,
        yearMonth: "2024-09",
        photoCount: 10,
      },
      {
        id: 5,
        yearMonth: "2024-08",
        photoCount: 10,
      },
      {
        id: 6,
        yearMonth: "2024-07",
        photoCount: 10,
      },
      {
        id: 7,
        yearMonth: "2024-06",
        photoCount: 10,
      },
      {
        id: 8,
        yearMonth: "2024-05",
        photoCount: 10,
      },
      {
        id: 9,
        yearMonth: "2024-04",
        photoCount: 10,
      },
      {
        id: 10,
        yearMonth: "2024-03",
        photoCount: 10,
      },
      {
        id: 11,
        yearMonth: "2024-02",
        photoCount: 10,
      },
      {
        id: 12,
        yearMonth: "2024-01",
        photoCount: 10,
      },
    ];
  } else {
    return [
      {
        id: 1,
        yearMonth: "2024-12",
        photoCount: 3,
      },
      {
        id: 2,
        yearMonth: "2024-11",
        photoCount: 3,
      },
      {
        id: 3,
        yearMonth: "2024-10",
        photoCount: 3,
      },
      {
        id: 4,
        yearMonth: "2024-09",
        photoCount: 3,
      },
      {
        id: 5,
        yearMonth: "2024-08",
        photoCount: 3,
      },
      {
        id: 6,
        yearMonth: "2024-07",
        photoCount: 3,
      },
      {
        id: 7,
        yearMonth: "2024-06",
        photoCount: 3,
      },
      {
        id: 8,
        yearMonth: "2024-06",
        photoCount: 3,
      },
      {
        id: 9,
        yearMonth: "2024-05",
        photoCount: 3,
      },
      {
        id: 10,
        yearMonth: "2024-04",
        photoCount: 3,
      },
      {
        id: 11,
        yearMonth: "2024-03",
        photoCount: 3,
      },
      {
        id: 12,
        yearMonth: "2024-02",
        photoCount: 3,
      },
      {
        id: 13,
        yearMonth: "2024-01",
        photoCount: 3,
      },
    ];
  }
  const res = await get<PhotoFolder[]>("/photo/folders", params);
  return res.data;
};

export const getPhotos = async (params: {
  folderId: number;
}): Promise<Photo[]> => {
  return [
    {
      id: 1,
      src: haoImg,
      date: "2024-12-01",
    },
    {
      id: 2,
      src: haoImg,
      date: "2024-11-28",
    },
    {
      id: 3,
      src: haoImg,
      date: "2024-11-25",
    },
    {
      id: 4,
      src: haoImg,
      date: "2024-11-20",
    },
    {
      id: 5,
      src: haoImg,
      date: "2024-10-15",
    },
    {
      id: 6,
      src: haoImg,
      date: "2024-10-10",
    },
    {
      id: 7,
      src: haoImg,
      date: "2024-09-10",
    },
    {
      id: 8,
      src: haoImg,
      date: "2024-09-05",
    },
    {
      id: 9,
      src: haoImg,
      date: "2024-08-20",
    },
    {
      id: 10,
      src: haoImg,
      date: "2024-08-15",
    },
    {
      id: 11,
      src: haoImg,
      date: "2024-08-10",
    },
    {
      id: 12,
      src: haoImg,
      date: "2024-08-05",
    },
    {
      id: 13,
      src: haoImg,
      date: "2024-07-20",
    },
    {
      id: 14,
      src: haoImg,
      date: "2024-07-15",
    },
    {
      id: 15,
      src: haoImg,
      date: "2024-07-10",
    },
    {
      id: 16,
      src: haoImg,
      date: "2024-07-05",
    },
    {
      id: 17,
      src: haoImg,
      date: "2024-06-20",
    },
    {
      id: 18,
      src: haoImg,
      date: "2024-06-15",
    },
    {
      id: 19,
      src: haoImg,
      date: "2024-06-10",
    },
    {
      id: 20,
      src: haoImg,
      date: "2024-06-05",
    },
    {
      id: 21,
      src: haoImg,
      date: "2024-05-20",
    },
    {
      id: 22,
      src: haoImg,
      date: "2024-05-15",
    },
    {
      id: 23,
      src: haoImg,
      date: "2024-05-10",
    },
    {
      id: 24,
      src: haoImg,
      date: "2024-05-05",
    },
    {
      id: 25,
      src: haoImg,
      date: "2024-04-20",
    },
    {
      id: 26,
      src: haoImg,
      date: "2024-04-15",
    },
    {
      id: 27,
      src: haoImg,
      date: "2024-04-10",
    },
    {
      id: 28,
      src: haoImg,
      date: "2024-04-05",
    },
    {
      id: 29,
      src: haoImg,
      date: "2024-03-20",
    },
    {
      id: 30,
      src: haoImg,
      date: "2024-03-15",
    },
  ];
  // const res = await get<Photo[]>("/photo/list", params);
  // return res.data;
};
