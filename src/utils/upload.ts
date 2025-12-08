export function generateDateWithHash(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const dateStr = `${yyyy}-${mm}-${dd}`;
  // 随机 6 位 16进制 hash
  const hash = Math.random().toString(16).substring(2, 8);

  return `${dateStr}-${hash}`;
}

export function buildMultipartFormData(
  buffer: ArrayBuffer,
  fields: Record<string, any>,
  filename: string,
  mime = "application/octet-stream"
) {
  const boundary =
    "----WebKitFormBoundary" + Math.random().toString(36).substr(2);

  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const parts: ArrayBuffer[] = [];

  // 字段部分
  for (const key in fields) {
    const part = [
      CRLF,
      `--${boundary}`,
      `Content-Disposition: form-data; name="${key}"`,
      "",
      String(fields[key]),
    ].join(CRLF);
    parts.push(encoder.encode(part));
  }

  // 文件部分
  const fileHeader = [
    CRLF,
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    `Content-Type: ${mime}`,
    CRLF,
  ].join(CRLF);

  parts.push(encoder.encode(fileHeader));
  parts.push(buffer); // 正文
  parts.push(encoder.encode(`${CRLF}--${boundary}--${CRLF}`));

  // 合并所有 ArrayBuffer
  const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
  const formDataBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const p of parts) {
    formDataBuffer.set(new Uint8Array(p), offset);
    offset += p.byteLength;
  }

  return {
    buffer: formDataBuffer.buffer,
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

// 格式化文件大小，使其更易读
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// 从文件名获取扩展名，如果没有则默认为 .jpg
export const getFileExtension = (filename?: string): string => {
  if (!filename) return ".jpg";
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return ".jpg";
  const ext = filename.substring(lastDot).toLowerCase();
  // 确保是有效的图片或视频扩展名
  const validExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".mp4",
    ".mov",
    ".avi",
  ];
  return validExtensions.includes(ext) ? ext : ".jpg";
};
