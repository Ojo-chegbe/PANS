import type { Where } from "payload";
export const roles = [
  "admin",
  "manager",
  "mentor",
  "contributor",
  "student",
] as const;
export type Role = (typeof roles)[number];
export type ID = number;
export type Actor = { id: ID; roles?: Role[]; email?: string; name?: string };
export type RecordData = { id: ID; [key: string]: any };
export const isStaff = (user?: Actor | null) =>
  Boolean(user?.roles?.some((role) => role === "admin" || role === "manager"));
export const isAdmin = (user?: Actor | null) =>
  Boolean(user?.roles?.includes("admin"));
export const owns = (user: Actor | null | undefined, owner: unknown) =>
  Boolean(user && String(user.id) === String(relationID(owner)));
export function relationID(value: unknown): ID | undefined {
  const candidate =
    typeof value === "object" && value !== null && "id" in value
      ? (value as { id: unknown }).id
      : value;
  if (
    typeof candidate !== "number" &&
    (typeof candidate !== "string" || !/^\d+$/.test(candidate))
  )
    return undefined;
  const id = Number(candidate);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}
export const money = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: amount % 100 ? 2 : 0,
  }).format(amount / 100);
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function safeNext(value: unknown, fallback = "/account") {
  return typeof value === "string" &&
    /^\/(?!\/)/.test(value) &&
    !/[\\\r\n]/.test(value)
    ? value
    : fallback;
}
export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
export function assert(
  condition: unknown,
  message: string,
  status = 400,
): asserts condition {
  if (!condition) throw new DomainError(message, status);
}
export const published: Where = {
  and: [
    { _status: { equals: "published" } },
    { reviewStatus: { equals: "approved" } },
  ],
};
export function calculateCart(
  products: RecordData[],
  input: { product: ID; quantity: number }[],
) {
  assert(
    input.length > 0 && input.length <= 40,
    "Choose at least one product.",
  );
  const seen = new Set<string>();
  const items = input.map((line) => {
    const product = products.find(
      (item) => String(item.id) === String(line.product),
    );
    assert(
      product &&
        product._status === "published" &&
        product.reviewStatus === "approved",
      "A product is no longer available.",
    );
    assert(
      product.salesOpen !== false,
      product.title + " is not available to purchase yet.",
    );
    assert(
      !seen.has(String(product.id)),
      "The basket contains a duplicate product.",
    );
    seen.add(String(product.id));
    assert(
      Number.isSafeInteger(line.quantity) &&
        line.quantity >= 1 &&
        line.quantity <= 20,
      "Choose a quantity between 1 and 20.",
    );
    assert(
      product.type === "physical" || line.quantity === 1,
      "Digital products and courses can only be purchased once per order.",
    );
    assert(
      Number.isSafeInteger(product.price) && product.price >= 0,
      "This product does not have a valid price.",
    );
    if (product.type === "physical")
      assert(
        product.stock >= line.quantity,
        product.title + " is currently out of stock.",
      );
    if (product.type === "digital")
      assert(relationID(product.file), "This download is not available yet.");
    if (product.type === "course")
      assert(relationID(product.course), "This course is not available yet.");
    return {
      product: product.id,
      title: product.title,
      unitPrice: product.price,
      quantity: line.quantity,
      type: product.type,
      course: relationID(product.course),
      file: relationID(product.file),
    };
  });
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  assert(Number.isSafeInteger(total), "The order total is invalid.");
  return { items, total, currency: "NGN" as const };
}
export function verifyPayment(
  order: RecordData,
  payment: {
    reference?: string;
    amount?: number;
    currency?: string;
    status?: string;
    customer?: { email?: string };
  },
) {
  assert(payment.status === "success", "Payment has not been confirmed.", 409);
  assert(
    payment.reference === order.reference,
    "The payment reference does not match.",
    409,
  );
  assert(
    payment.currency === order.currency && payment.amount === order.total,
    "The payment amount does not match this order.",
    409,
  );
  assert(
    payment.customer?.email?.toLowerCase() ===
      order.customerEmail?.toLowerCase(),
    "The payment customer does not match this order.",
    409,
  );
}
