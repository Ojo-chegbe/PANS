import { getCMS } from "@/lib/payload";
import { isStaff, type Actor } from "@/lib/domain";
const cell = (value: unknown) => {
  let text = String(value ?? "");
  if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};
export async function GET(request: Request) {
  const payload = await getCMS();
  const { user } = await payload.auth({ headers: request.headers });
  if (!isStaff(user as Actor | null))
    return new Response("Not permitted", { status: 403 });
  const event = new URL(request.url).searchParams.get("event");
  if (!event) return new Response("Choose an event", { status: 400 });
  const rows = await payload.find({
    collection: "registrations",
    where: { event: { equals: event } },
    limit: 10000,
    depth: 0,
    overrideAccess: false,
    user: user!,
  });
  const csv = [
    [
      "Name",
      "Email",
      "Phone",
      "Level",
      "Department",
      "Status",
      "Registration date",
    ],
    ...rows.docs.map((row) => [
      row.name,
      row.email,
      row.phone,
      row.level,
      row.department,
      row.status,
      row.createdAt,
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
  return new Response("\ufeff" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="event-registrations.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
