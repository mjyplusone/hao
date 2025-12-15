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

// 兼容微信小程序的字符串编码函数
function encodeString(str: string): Uint8Array {
  // 如果支持 TextEncoder，直接使用
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }

  // 否则手动实现 UTF-8 编码
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (
      (charCode & 0xfc00) === 0xd800 &&
      i + 1 < str.length &&
      (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
    ) {
      // 代理对
      charCode =
        0x10000 +
        (((charCode & 0x03ff) << 10) | (str.charCodeAt(++i) & 0x03ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    } else {
      utf8.push(
        0xe0 | (charCode >> 12),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
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
  const parts: (Uint8Array | ArrayBuffer)[] = [];

  // 字段部分
  for (const key in fields) {
    const part = [
      CRLF,
      `--${boundary}`,
      `Content-Disposition: form-data; name="${key}"`,
      "",
      String(fields[key]),
    ].join(CRLF);
    parts.push(encodeString(part));
  }

  // 文件部分
  const fileHeader = [
    CRLF,
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    `Content-Type: ${mime}`,
    CRLF,
  ].join(CRLF);

  parts.push(encodeString(fileHeader));
  parts.push(new Uint8Array(buffer)); // 正文
  parts.push(encodeString(`${CRLF}--${boundary}--${CRLF}`));

  // 合并所有 ArrayBuffer
  const totalLength = parts.reduce(
    (sum, p) => sum + (p instanceof Uint8Array ? p.byteLength : p.byteLength),
    0
  );
  const formDataBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const p of parts) {
    const uint8Array = p instanceof Uint8Array ? p : new Uint8Array(p);
    formDataBuffer.set(uint8Array, offset);
    offset += uint8Array.byteLength;
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
