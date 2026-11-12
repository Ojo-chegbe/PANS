export const VIDEO_MAX_BYTES = 20 * 1024 ** 3;
export const VIDEO_PART_BYTES = 16 * 1024 ** 2;
export type VideoSession = {
  token: string;
  filename: string;
  size: number;
  fingerprint: string;
  partSize: number;
  expiresAt: number;
};
export type VideoUploadStatus = {
  parts: { number: number; size: number }[];
  file?: { id: number | string; label: string };
  assembled?: boolean;
};

export function videoPartSize(size: number, number: number) {
  if (
    !Number.isSafeInteger(size) ||
    size < 1 ||
    size > VIDEO_MAX_BYTES ||
    !Number.isSafeInteger(number) ||
    number < 1 ||
    number > Math.ceil(size / VIDEO_PART_BYTES)
  )
    throw new Error("Invalid video part.");
  return Math.min(VIDEO_PART_BYTES, size - (number - 1) * VIDEO_PART_BYTES);
}
