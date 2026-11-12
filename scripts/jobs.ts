import { existsSync } from "node:fs";
import { shutdown } from "./shutdown";
import { expireReservations } from "../src/services/order-maintenance";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const { getPayload } = await import("payload");
const config = (await import("../src/payload.config")).default;
const payload = await getPayload({ config });
console.log("PANS job worker started.");
let stop = false;
process.on("SIGINT", () => {
  stop = true;
});
process.on("SIGTERM", () => {
  stop = true;
});
while (!stop) {
  try {
    await payload.jobs.run({ limit: 20, overrideAccess: true });
    await expireReservations(payload);
    await payload.delete({
      collection: "rate-limits",
      where: { expiresAt: { less_than: new Date().toISOString() } },
      overrideAccess: true,
    });
  } catch (error) {
    console.error("A background job failed. It will be retried.");
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
await shutdown(payload);
