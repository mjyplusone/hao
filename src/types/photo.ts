export interface Photo {
  id: number;
  name: string;
  size: number;
  user_id: number;
  thumbnail_url: string;
  preview_url?: string;
  created_at?: string;
  transcode_status: number;
  upload_progress: number;
  upload_status: number;
}

export type ViewMode = "all" | "my";

export interface PhotoFolder {
  id: number;
  name: string;
  updated_at: string;
  created_at: string;
  photoCount: number;
}
