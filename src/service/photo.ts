import { Photo, PhotoFolder } from "@/types";
import { get } from "@/utils/request";

export const getPhotoFolders = async (): Promise<PhotoFolder[]> => {
  const res = await get<{ items: PhotoFolder[]; total: number }>("/folders");
  return res.items;
};

export const getFolderPhotos = async (params: {
  folderId: number;
  page: number;
  user?: string;
}): Promise<Photo[]> => {
  const res = await get<{ items: Photo[]; total: number }>(
    `/folder/${params.folderId}/files`,
    {
      page: params.page,
      size: 21,
      ...(params.user ? { user: params.user } : {}),
    }
  );
  return res.items;
};
