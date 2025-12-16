// 判断文件类型（图片或视频）
export const getFileType = (fileName: string): "image" | "video" => {
  if (!fileName) return "image";
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico"];
  const videoExts = [
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "flv",
    "wmv",
    "m4v",
    "3gp",
  ];

  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";
  return "image"; // 默认当作图片处理
};
