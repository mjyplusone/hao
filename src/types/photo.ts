export interface Photo {
  id: number;
  src: string;
  date: string;
}

export type ViewMode = "all" | "my";

export interface PhotoFolder {
  id: number;
  yearMonth: string;
  photoCount: number;
}
