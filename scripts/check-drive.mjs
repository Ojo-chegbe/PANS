import { mkdir, writeFile } from "node:fs/promises";
import { load } from "cheerio";

// Read-only probe: no credentials, permission changes, or complete media downloads.
const ids = [...new Set(process.argv.slice(2))];
if (!ids.length || ids.some((id) => !/^[\w-]{10,100}$/.test(id)))
  throw new Error("Provide one or more Google Drive file IDs.");
await mkdir(".data/drive-pilot", { recursive: true });
async function limitedBody(response, limit) {
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  try {
    while (size < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      const part = value.subarray(0, limit - size);
      chunks.push(part);
      size += part.length;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks);
}
const results = [];
for (const id of ids) {
  const result = { id };
  try {
    const preview = await fetch(`https://drive.google.com/file/d/${id}/view`, {
      signal: AbortSignal.timeout(25000),
    });
    const html = (await limitedBody(preview, 512 * 1024)).toString("utf8");
    const $ = load(html);
    result.preview = {
      status: preview.status,
      host: new URL(preview.url).hostname,
      title: $("title").text(),
      name: $('meta[property="og:title"]').attr("content"),
    };
    const download = await fetch(
      `https://drive.google.com/uc?export=download&id=${id}`,
      {
        headers: { Range: "bytes=0-65535" },
        signal: AbortSignal.timeout(25000),
      },
    );
    const sample = await limitedBody(download, 65536);
    result.download = {
      status: download.status,
      host: new URL(download.url).hostname,
      contentType: download.headers.get("content-type"),
      contentRange: download.headers.get("content-range"),
      contentLength: download.headers.get("content-length"),
      acceptsRanges: download.headers.get("accept-ranges"),
      bytesInspected: sample.length,
      isPDF: sample.subarray(0, 5).toString() === "%PDF-",
      isMP4: sample.subarray(4, 8).toString() === "ftyp",
    };
    if (result.download.contentType?.includes("text/html")) {
      const html = load(sample.toString("utf8"));
      result.download.pageTitle = html("title").text();
      result.download.confirmationForm =
        html('form[action*="download"]').length > 0;
    }
  } catch (error) {
    result.error = error.message;
  }
  results.push(result);
  console.log(JSON.stringify(result));
}
await writeFile(
  ".data/drive-pilot/public-probe.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), authenticated: false, results },
    null,
    2,
  ),
);
