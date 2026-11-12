/** Production previews are allowed only on loopback and must be explicitly enabled. */
export function isLocalPreview() {
  if (process.env.PANS_LOCAL_PREVIEW !== "1") return false;
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000")
        .hostname,
    );
  } catch {
    return false;
  }
}
