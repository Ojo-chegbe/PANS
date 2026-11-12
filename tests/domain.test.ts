import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCart,
  verifyPayment,
  safeNext,
  isStaff,
  owns,
  type RecordData,
} from "../src/lib/domain";
const product: RecordData = {
  id: 1,
  title: "Study guide",
  price: 125000,
  type: "digital",
  file: 7,
  salesOpen: true,
  _status: "published",
  reviewStatus: "approved",
};
test("checkout uses catalogue prices and integer kobo", () => {
  const cart = calculateCart([product], [{ product: 1, quantity: 1 }]);
  assert.equal(cart.total, 125000);
  assert.equal(cart.items[0].unitPrice, 125000);
  assert.equal(cart.currency, "NGN");
});
test("checkout rejects draft, unapproved and unavailable products", () => {
  for (const patch of [
    { _status: "draft" },
    { reviewStatus: "pending" },
    { salesOpen: false },
  ])
    assert.throws(() =>
      calculateCart([{ ...product, ...patch }], [{ product: 1, quantity: 1 }]),
    );
});
test("checkout rejects missing files, duplicate items and repeated digital purchases", () => {
  assert.throws(() =>
    calculateCart([{ ...product, file: null }], [{ product: 1, quantity: 1 }]),
  );
  assert.throws(() =>
    calculateCart(
      [product],
      [
        { product: 1, quantity: 1 },
        { product: 1, quantity: 1 },
      ],
    ),
  );
  assert.throws(() => calculateCart([product], [{ product: 1, quantity: 2 }]));
});
test("stock and quantity are checked on the server", () => {
  const physical = { ...product, type: "physical", stock: 2 };
  assert.equal(
    calculateCart([physical], [{ product: 1, quantity: 2 }]).total,
    250000,
  );
  for (const quantity of [0, -1, 1.5, 3, 21])
    assert.throws(() => calculateCart([physical], [{ product: 1, quantity }]));
});
test("payment must match reference, amount, currency, customer and successful status", () => {
  const order = {
    id: 1,
    reference: "PANS-example",
    total: 125000,
    currency: "NGN",
    customerEmail: "member@example.test",
  };
  const payment = {
    reference: order.reference,
    amount: order.total,
    currency: "NGN",
    status: "success",
    customer: { email: "MEMBER@example.test" },
  };
  assert.doesNotThrow(() => verifyPayment(order, payment));
  for (const patch of [
    { reference: "another-order" },
    { amount: 1 },
    { currency: "USD" },
    { status: "pending" },
    { customer: { email: "other@example.test" } },
  ])
    assert.throws(() => verifyPayment(order, { ...payment, ...patch }));
});
test("redirects stay within the application", () => {
  assert.equal(safeNext("/account/events"), "/account/events");
  for (const url of [
    "https://example.test",
    "//example.test",
    "/\\example.test",
    "/account\r\nLocation: x",
  ])
    assert.equal(safeNext(url), "/account");
});
test("permissions do not treat students or contributors as staff", () => {
  assert.equal(isStaff({ id: 1, roles: ["student", "contributor"] }), false);
  assert.equal(isStaff({ id: 1, roles: ["manager"] }), true);
  assert.equal(owns({ id: 1 }, { id: "1" }), true);
  assert.equal(owns({ id: 2 }, 1), false);
});
