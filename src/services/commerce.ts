import { randomUUID } from "node:crypto";
import type { Payload, PayloadRequest } from "payload";
import {
  calculateCart,
  verifyPayment,
  assert,
  relationID,
  isAdmin,
  type Actor,
  type ID,
  type RecordData,
} from "@/lib/domain";
import { transaction } from "@/lib/transactions";
import { notify } from "./notifications";
async function paystack(endpoint: string, method = "GET", body?: unknown) {
  assert(
    process.env.PAYSTACK_SECRET_KEY,
    "Online payments are not available yet. Please try again later.",
    503,
  );
  let response: Response;
  try {
    response = await fetch("https://api.paystack.co" + endpoint, {
      method,
      headers: {
        Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "The payment service did not respond. Please check your order before trying again.",
    );
  }
  const data = await response.json();
  assert(
    response.ok && data.status,
    "The payment service could not complete this request.",
    502,
  );
  return data.data;
}
export async function grant(
  payload: Payload,
  owner: ID,
  item: { product?: ID; course?: ID; file?: ID },
  order: ID | undefined,
  req: PayloadRequest,
) {
  const key =
    owner +
    ":" +
    (item.product ? "product:" + item.product : "course:" + item.course);
  const existing = await payload.find({
    collection: "entitlements",
    where: { key: { equals: key } },
    limit: 1,
    overrideAccess: true,
    req,
  });
  const data = {
    owner,
    product: item.product,
    course: item.course,
    files: item.file ? [item.file] : [],
    order,
    active: true,
  };
  if (existing.docs[0])
    await payload.update({
      collection: "entitlements",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
      req,
    });
  else
    await payload.create({
      collection: "entitlements",
      data: { key, ...data },
      overrideAccess: true,
      req,
    });
  if (item.course) {
    const enrollmentKey = owner + ":" + item.course;
    const found = await payload.find({
      collection: "enrollments",
      where: { key: { equals: enrollmentKey } },
      limit: 1,
      overrideAccess: true,
      req,
    });
    if (!found.totalDocs)
      await payload.create({
        collection: "enrollments",
        data: { key: enrollmentKey, owner, course: item.course },
        overrideAccess: true,
        req,
      });
  }
}
async function complete(
  payload: Payload,
  order: RecordData,
  req: PayloadRequest,
) {
  if (["paid", "refund-pending", "refunded"].includes(order.paymentStatus))
    return order;
  assert(
    ["pending", "cancelled"].includes(order.paymentStatus),
    "This order cannot be fulfilled.",
    409,
  );
  const items = order.items || [];
  const physical = items.filter((item: any) => item.type === "physical");
  const stock = await Promise.all(
    physical.map((item: any) =>
      payload.findByID({
        collection: "products",
        id: relationID(item.product)!,
        overrideAccess: true,
        req,
      }),
    ),
  );
  const needsAttention =
    !order.stockReserved &&
    physical.some(
      (item: any, index: number) => (stock[index].stock || 0) < item.quantity,
    );
  for (const item of items) {
    if (item.type === "physical" && !order.stockReserved && !needsAttention) {
      const product = await payload.findByID({
        collection: "products",
        id: relationID(item.product)!,
        overrideAccess: true,
        req,
      });
      assert(
        (product.stock || 0) >= item.quantity,
        "Payment received, but stock needs staff attention. Please contact PANS.",
        409,
      );
      await payload.update({
        collection: "products",
        id: product.id,
        data: { stock: (product.stock || 0) - item.quantity },
        overrideAccess: true,
        req,
        context: { system: true },
      });
    }
    if (item.type !== "physical")
      await grant(
        payload,
        relationID(order.owner)!,
        {
          product: relationID(item.product),
          course: relationID(item.course),
          file: relationID(item.file),
        },
        order.id,
        req,
      );
  }
  const result = await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      paymentStatus: "paid",
      fulfilment: needsAttention
        ? "needs-attention"
        : items.some((x: any) => x.type === "physical")
          ? "pending"
          : "complete",
    },
    overrideAccess: true,
    req,
  });
  await notify(
    payload,
    relationID(order.owner)!,
    "Your PANS order is confirmed",
    needsAttention
      ? "Your payment has been received. The PANS team will contact you about availability of your physical items. Digital purchases are available in your account."
      : "Your payment has been confirmed. Your purchases are available in your account.",
    "/account/orders/" + order.id,
    req,
  );
  return result;
}
export async function checkout(
  payload: Payload,
  user: Actor,
  input: { items: { product: ID; quantity: number }[] },
) {
  assert(input.items?.length, "Your basket is empty.");
  const products = await payload.find({
    collection: "products",
    where: { id: { in: input.items.map((x) => x.product) } },
    limit: 40,
    depth: 0,
    overrideAccess: false,
    user: user as any,
  });
  if (products.docs.some((product) => product.price > 0))
    assert(
      process.env.PAYSTACK_SECRET_KEY,
      "Online payments are not available yet. Your basket has been kept.",
      503,
    );
  const order = await transaction(payload, "checkout", async (req) => {
    const latest = await payload.find({
      collection: "products",
      where: { id: { in: input.items.map((x) => x.product) } },
      limit: 40,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const orders = await payload.find({
      collection: "orders",
      where: {
        and: [
          { owner: { equals: user.id } },
          { paymentStatus: { equals: "pending" } },
          {
            reservationExpiresAt: {
              greater_than: new Date().toISOString(),
            },
          },
        ],
      },
      limit: 10,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const same = orders.docs.find(
      (o: any) =>
        JSON.stringify(
          o.items.map((x: any) => [relationID(x.product), x.quantity]).sort(),
        ) ===
        JSON.stringify(input.items.map((x) => [x.product, x.quantity]).sort()),
    );
    if (same) return same;
    const cart = calculateCart(latest.docs as RecordData[], input.items);
    for (const item of cart.items) {
      if (item.type !== "physical") {
        const owned = await payload.find({
          collection: "entitlements",
          where: {
            and: [
              { owner: { equals: user.id } },
              { active: { equals: true } },
              {
                or: [
                  { product: { equals: item.product } },
                  ...(item.course ? [{ course: { equals: item.course } }] : []),
                ],
              },
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        });
        if (owned.docs[0]) {
          const previous = relationID(owned.docs[0].order);
          if (cart.items.length === 1 && previous)
            return payload.findByID({
              collection: "orders",
              id: previous,
              depth: 0,
              overrideAccess: true,
              req,
            });
          assert(
            false,
            "You already have access to " +
              item.title +
              ". Remove it from your basket.",
          );
        }
      }
      if (item.type === "course") {
        const count = await payload.count({
          collection: "lessons",
          where: {
            and: [
              { course: { equals: item.course } },
              { _status: { equals: "published" } },
              { reviewStatus: { equals: "approved" } },
            ],
          },
          overrideAccess: true,
          req,
        });
        assert(
          count.totalDocs > 0,
          "This course is not ready for enrolment yet.",
        );
      }
    }
    for (const line of cart.items) {
      if (line.type === "physical") {
        const product = latest.docs.find((p) => p.id === line.product)!;
        await payload.update({
          collection: "products",
          id: product.id,
          data: { stock: (product.stock || 0) - line.quantity },
          overrideAccess: true,
          req,
          context: { system: true },
        });
      }
    }
    const created = await payload.create({
      collection: "orders",
      data: {
        owner: user.id,
        reference: "PANS-" + randomUUID(),
        customerEmail: user.email!,
        ...cart,
        stockReserved: true,
        reservationExpiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      },
      overrideAccess: true,
      req,
    });
    if (cart.total === 0) return complete(payload, created as RecordData, req);
    return created;
  });
  if (order.paymentStatus === "paid")
    return { redirect: "/account/orders/" + order.id };
  if (order.checkoutURL) return { redirect: order.checkoutURL };
  try {
    const response = await paystack("/transaction/initialize", "POST", {
      email: user.email,
      amount: order.total,
      currency: "NGN",
      reference: order.reference,
      callback_url:
        (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000") +
        "/payment/return",
      metadata: { order_id: order.id },
    });
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { checkoutURL: response.authorization_url },
      overrideAccess: true,
      context: { system: true },
    });
    return { redirect: response.authorization_url };
  } catch (error) {
    throw error;
  }
}
export async function confirmPayment(
  payload: Payload,
  reference: string,
  user?: Actor,
) {
  const found = await payload.find({
    collection: "orders",
    where: { reference: { equals: reference } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const order = found.docs[0];
  assert(order, "This order could not be found.", 404);
  if (user)
    assert(
      String(relationID(order.owner)) === String(user.id),
      "This order is not available.",
      403,
    );
  const payment = await paystack(
    "/transaction/verify/" + encodeURIComponent(reference),
  );
  verifyPayment(order as RecordData, payment);
  return transaction(payload, "checkout", async (req) => {
    const latest = await payload.findByID({
      collection: "orders",
      id: order.id,
      depth: 0,
      overrideAccess: true,
      req,
    });
    if (payment.id)
      await payload.update({
        collection: "orders",
        id: latest.id,
        data: { providerID: String(payment.id) },
        overrideAccess: true,
        req,
      });
    return complete(payload, latest as RecordData, req);
  });
}
export async function cancelOrder(
  payload: Payload,
  user: Actor,
  id: ID,
  expired = false,
) {
  return transaction(payload, "checkout", async (req) => {
    const order = await payload.findByID({
      collection: "orders",
      id,
      depth: 0,
      overrideAccess: true,
      req,
    });
    assert(
      String(relationID(order.owner)) === String(user.id),
      "This order is not available.",
      403,
    );
    assert(
      order.paymentStatus === "pending",
      "Only an unpaid order can be cancelled.",
      409,
    );
    if (process.env.PAYSTACK_SECRET_KEY && order.checkoutURL) {
      const payment = await paystack(
        "/transaction/verify/" + encodeURIComponent(order.reference),
      );
      if (payment.status === "success") {
        verifyPayment(order as RecordData, payment);
        await complete(payload, order as RecordData, req);
        return {
          message:
            "Payment was already received. Your order has been confirmed.",
        };
      }
      assert(
        expired ||
          !["ongoing", "pending", "processing", "queued"].includes(
            payment.status,
          ),
        "Payment is still processing. Please check again shortly.",
        409,
      );
    }
    if (order.stockReserved)
      for (const item of order.items || []) {
        if (item.type === "physical") {
          const p = await payload.findByID({
            collection: "products",
            id: relationID(item.product)!,
            overrideAccess: true,
            req,
          });
          await payload.update({
            collection: "products",
            id: p.id,
            data: { stock: (p.stock || 0) + item.quantity },
            overrideAccess: true,
            req,
            context: { system: true },
          });
        }
      }
    await payload.update({
      collection: "orders",
      id,
      data: {
        paymentStatus: "cancelled",
        fulfilment: "cancelled",
        stockReserved: false,
      },
      overrideAccess: true,
      req,
    });
    return { message: "Your order has been cancelled." };
  });
}
export async function issueRefund(payload: Payload, user: Actor, id: ID) {
  assert(
    isAdmin(user),
    "Administrator access is required to issue a refund.",
    403,
  );
  return transaction(payload, "checkout", async (req) => {
    const order = await payload.findByID({
      collection: "orders",
      id,
      depth: 0,
      overrideAccess: true,
      req,
    });
    if (
      order.paymentStatus === "refund-pending" ||
      order.paymentStatus === "refunded"
    )
      return { message: "This refund has already been requested." };
    assert(
      order.paymentStatus === "paid" && order.total > 0,
      "Only a paid order can be refunded.",
      409,
    );
    const reference = "PANS-REFUND-" + order.reference;
    try {
      await paystack("/refund", "POST", {
        transaction: order.reference,
        amount: order.total,
        currency: order.currency,
        reference,
      });
    } catch (error) {
      const existing = await paystack(
        "/refund?reference=" + encodeURIComponent(reference),
      ).catch(() => []);
      if (
        !existing.some(
          (refund: any) =>
            refund.reference === reference &&
            ["pending", "processing", "processed", "needs-attention"].includes(
              refund.status,
            ),
        )
      )
        throw error;
    }
    await payload.update({
      collection: "orders",
      id,
      data: { paymentStatus: "refund-pending" },
      overrideAccess: true,
      req,
    });
    await notify(
      payload,
      relationID(order.owner)!,
      "Your refund has been requested",
      "The payment provider is processing your refund. Your order will be updated when it is confirmed.",
      "/account/orders/" + id,
      req,
    );
    return {
      message: "The refund has been requested.",
      redirect: "/admin/collections/orders/" + id,
    };
  });
}
export async function reconcileRefund(
  payload: Payload,
  refundID: string | number,
) {
  const refund = await paystack(
    "/refund/" + encodeURIComponent(String(refundID)),
  );
  if (refund.status !== "processed") return;
  const payment =
    typeof refund.transaction === "object"
      ? refund.transaction
      : await paystack(
          "/transaction/" + encodeURIComponent(String(refund.transaction)),
        );
  const found = await payload.find({
    collection: "orders",
    where: { reference: { equals: payment.reference } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const order = found.docs[0];
  assert(
    order &&
      refund.currency === order.currency &&
      Number(refund.amount) > 0 &&
      Number(refund.amount) <= order.total,
    "The refund does not match a local order.",
    409,
  );
  if (Number(refund.amount) !== order.total) return; // Partial refunds retain access until the agreed policy says otherwise.
  await transaction(payload, "checkout", async (req) => {
    const current = await payload.findByID({
      collection: "orders",
      id: order.id,
      depth: 0,
      overrideAccess: true,
      req,
    });
    if (current.paymentStatus === "refunded") return;
    assert(
      ["paid", "refund-pending"].includes(current.paymentStatus || ""),
      "This order cannot be marked refunded.",
      409,
    );
    await payload.update({
      collection: "entitlements",
      where: { order: { equals: current.id } },
      data: { active: false },
      overrideAccess: true,
      req,
    });
    if (current.stockReserved && current.fulfilment !== "collected")
      for (const item of current.items || [])
        if (item.type === "physical") {
          const product = await payload.findByID({
            collection: "products",
            id: relationID(item.product)!,
            overrideAccess: true,
            req,
          });
          await payload.update({
            collection: "products",
            id: product.id,
            data: { stock: (product.stock || 0) + item.quantity },
            overrideAccess: true,
            req,
            context: { system: true },
          });
        }
    await payload.update({
      collection: "orders",
      id: current.id,
      data: {
        paymentStatus: "refunded",
        stockReserved: false,
        fulfilment:
          current.fulfilment === "collected" ? "collected" : "cancelled",
      },
      overrideAccess: true,
      req,
    });
    await notify(
      payload,
      relationID(current.owner)!,
      "Your refund is confirmed",
      "The payment provider has confirmed your refund. Access associated with this purchase has been removed.",
      "/account/orders/" + current.id,
      req,
    );
  });
}
