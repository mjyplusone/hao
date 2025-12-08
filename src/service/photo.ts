import { Photo, PhotoFolder, ViewMode } from "@/types";
import { get } from "@/utils/request";

export const getPhotoFolders = async (params: {
  viewMode: ViewMode;
}): Promise<PhotoFolder[]> => {
  const res = await get<{ items: PhotoFolder[]; total: number }>(
    "/folders",
    params
  );
  return res.items;
};

export const getPhotos = async (params: {
  folderId: number;
  page: number;
}): Promise<Photo[]> => {
  const res = await get<{ items: Photo[]; total: number }>(
    `/folder/${params.folderId}/files`,
    {
      page: params.page,
      size: 20,
    }
  );
  return res.items;
};
