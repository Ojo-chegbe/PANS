import { createHash } from "node:crypto";
import type { Payload, PayloadRequest } from "payload";
import { createLocalReq } from "payload";
import { sql } from "drizzle-orm";
const locks = new Map<string, Promise<unknown>>();
export async function transaction<T>(
  payload: Payload,
  key: string,
  run: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const previous = locks.get(key) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queue = previous.catch(() => {}).then(() => current);
  locks.set(key, queue);
  await previous.catch(() => {});
  let id: any;
  try {
    const req = await createLocalReq({ context: { system: true } }, payload);
    id = await payload.db.beginTransaction();
    if (id !== null && id !== undefined) {
      req.transactionID = id;
      if (process.env.DATABASE_URL) {
        const db = (payload.db as any).sessions[id]?.db;
        if (!db)
          throw new Error(
            "Could not acquire the transactional database connection.",
          );
        const digest = createHash("sha256").update(key).digest();
        await db.execute(
          sql`select pg_advisory_xact_lock(${digest.readInt32BE(0)}, ${digest.readInt32BE(4)})`,
        );
      }
    }
    const result = await run(req);
    if (id !== null && id !== undefined) await payload.db.commitTransaction(id);
    return result;
  } catch (error) {
    if (id !== null && id !== undefined)
      await payload.db.rollbackTransaction(id);
    throw error;
  } finally {
    release();
    if (locks.get(key) === queue) locks.delete(key);
  }
}
