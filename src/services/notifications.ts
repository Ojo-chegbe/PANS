import type { Payload, PayloadRequest } from "payload";
import type { ID } from "@/lib/domain";
export async function notify(
  payload: Payload,
  owner: ID,
  title: string,
  message: string,
  url = "/account",
  req?: PayloadRequest,
) {
  await payload.create({
    collection: "notifications",
    data: { owner, title, message, url },
    overrideAccess: true,
    req,
  });
  const user = await payload.findByID({
    collection: "users",
    id: owner,
    overrideAccess: true,
    req,
  });
  if (user.email)
    await payload.jobs.queue({
      task: "send-notification",
      input: {
        to: user.email,
        subject: title,
        text:
          message +
          "\n\n" +
          (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000") +
          url,
      },
      req,
    });
}
