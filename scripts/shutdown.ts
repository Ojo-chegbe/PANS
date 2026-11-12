import type { Payload } from "payload";
/** Close the PostgreSQL pool as well as Payload's schema resources in one-shot CLI tools. */
export async function shutdown(payload: Payload) {
  const pool = (payload.db as any).pool;
  if (pool) {
    // The adapter holds a monitoring client outside the idle pool. Release checked-out
    // clients before ending the pool; these tools have already awaited all operations.
    const idle = new Set((pool._idle || []).map((entry: any) => entry.client));
    for (const client of [...(pool._clients || [])])
      if (!idle.has(client))
        try {
          client.release(true);
        } catch {}
    await pool.end();
  }
  await payload.destroy();
}
