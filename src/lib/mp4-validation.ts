export class VideoContainerError extends Error {}
/** Inspect MP4 container structure using small range reads, never the video payload. */
export async function validateMp4(
  size: number,
  read: (start: number, end: number) => Promise<Buffer>,
) {
  let requests = 0;
  let bytes = 0;
  const boundedRead = async (start: number, length: number) => {
    if (
      ++requests > 128 ||
      (bytes += length) > 32768 ||
      start < 0 ||
      start + length > size
    )
      throw new VideoContainerError(
        "The MP4 metadata is incomplete or too complex. Export a standard MP4 and try again.",
      );
    const data = await read(start, start + length - 1);
    if (data.length !== length)
      throw new VideoContainerError("The video is incomplete.");
    return data;
  };
  const atom = async (start: number, end: number) => {
    if (end - start < 8)
      throw new VideoContainerError("The MP4 contains an incomplete box.");
    const data = await boundedRead(start, Math.min(16, end - start));
    const short = data.readUInt32BE(0);
    const header = short === 1 ? 16 : 8;
    if (short === 1 && data.length < 16)
      throw new VideoContainerError("Invalid MP4 box.");
    const length =
      short === 1
        ? Number(data.readBigUInt64BE(8))
        : short === 0
          ? end - start
          : short;
    if (
      !Number.isSafeInteger(length) ||
      length < header ||
      start + length > end
    )
      throw new VideoContainerError("The MP4 has invalid box sizes.");
    return {
      type: data.toString("ascii", 4, 8),
      start,
      end: start + length,
      header,
    };
  };
  const children = async function* (start: number, end: number) {
    while (start < end) {
      const box = await atom(start, end);
      yield box;
      start = box.end;
    }
  };
  let ftyp = false,
    mdat = false,
    video = false;
  for await (const box of children(0, size)) {
    if (box.type === "ftyp") {
      const length = box.end - box.start - box.header;
      if (box.start > 65536 || length < 8 || length > 4096 || length % 4)
        throw new VideoContainerError("Invalid MP4 file signature.");
      const brands = await boundedRead(box.start + box.header, length);
      ftyp = [
        0,
        ...Array.from({ length: length / 4 - 2 }, (_, i) => 8 + i * 4),
      ].some((offset) =>
        /^(isom|iso[2-9]|mp4[12]|avc1|M4V |MSNV|dash|cmfc|cmfs)$/.test(
          brands.toString("ascii", offset, offset + 4),
        ),
      );
    }
    if (box.type === "mdat" && box.end > box.start + box.header) mdat = true;
    if (box.type === "moov") {
      for await (const track of children(box.start + box.header, box.end)) {
        if (track.type !== "trak") continue;
        for await (const media of children(
          track.start + track.header,
          track.end,
        )) {
          if (media.type !== "mdia") continue;
          for await (const handler of children(
            media.start + media.header,
            media.end,
          )) {
            if (
              handler.type !== "hdlr" ||
              handler.end - handler.start < handler.header + 12
            )
              continue;
            const type = await boundedRead(
              handler.start + handler.header + 8,
              4,
            );
            if (type.toString("ascii") === "vide") video = true;
          }
        }
      }
    }
    if (ftyp && mdat && video) return { requests, bytes };
  }
  throw new VideoContainerError(
    "Choose a complete MP4 containing a video track. Export as H.264 MP4 for broad browser support.",
  );
}
