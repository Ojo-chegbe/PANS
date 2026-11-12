export function plainRichText(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: text.split(/\n\s*\n/).map((paragraph) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [
          {
            type: "text",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraph,
            version: 1,
          },
        ],
      })),
    },
  };
}
export function richTextPlainText(data: any): string {
  if (!data) return "";
  const walk = (node: any): string =>
    typeof node?.text === "string"
      ? node.text
      : (node?.children || [])
          .map(walk)
          .join(node.type === "root" ? "\n\n" : "");
  return walk(data.root);
}
