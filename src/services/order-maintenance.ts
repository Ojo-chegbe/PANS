import type { Payload } from "payload";
import { cancelOrder } from "./commerce";
import { relationID } from "@/lib/domain";
export async function expireReservations(payload: Payload) {
  const orders = await payload.find({
    collection: "orders",
    where: {
      and: [
        { paymentStatus: { equals: "pending" } },
        { reservationExpiresAt: { less_than: new Date().toISOString() } },
      ],
    },
    limit: 25,
    depth: 0,
    overrideAccess: true,
  });
  for (const order of orders.docs) {
    const owner = relationID(order.owner);
    if (owner)
      try {
        await cancelOrder(payload, { id: owner }, order.id, true);
      } catch {
        payload.logger.warn(
          "Could not reconcile an expired order; it will be retried.",
        );
      }
  }
}
