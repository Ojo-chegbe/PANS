import Link from "next/link";
import { notFound } from "next/navigation";
import { getCMS, requireSession } from "@/lib/payload";
import { PageIntro } from "@/components/Content";
import { ActionButton } from "@/components/ActionForm";
import { ClearBasket } from "@/components/Cart";
import { money, owns } from "@/lib/domain";
export const metadata = { title: "Your order" };
export default async function Order({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  const payload = await getCMS();
  let order: any;
  try {
    order = await payload.findByID({
      collection: "orders",
      id: (await params).id,
      depth: 2,
      overrideAccess: false,
      user,
    });
  } catch {
    notFound();
  }
  if (!owns(user, order.owner)) notFound();
  return (
    <>
      <Link className="back-link" href="/account/orders">
        Back to your orders
      </Link>
      <PageIntro
        eyebrow="Your purchase"
        title={
          order.paymentStatus === "paid"
            ? "Your order is confirmed."
            : "Your order."
        }
      />
      {order.paymentStatus === "paid" && <ClearBasket />}
      <div className="surface">
        <span className="status">
          {order.paymentStatus.replaceAll("-", " ")}
        </span>
        <p className="form-note">Reference: {order.reference}</p>
        {order.items?.map((item: any) => (
          <div className="basket-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.quantity} × {money(item.unitPrice)}
              </small>
              {order.paymentStatus === "paid" && item.type === "digital" && (
                <div className="section-actions">
                  <Link
                    className="quiet-link"
                    prefetch={false}
                    href={
                      "/download/" +
                      (typeof item.product === "object"
                        ? item.product?.id
                        : item.product)
                    }
                  >
                    Download
                  </Link>
                </div>
              )}
              {order.paymentStatus === "paid" && item.type === "course" && (
                <div className="section-actions">
                  <Link
                    className="quiet-link"
                    href={"/learn/" + item.course?.slug}
                  >
                    Open course
                  </Link>
                </div>
              )}
            </div>
            <span>{money(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="basket-total">
          <span>Total</span>
          <strong>{money(order.total)}</strong>
        </div>
        {order.paymentStatus === "paid" &&
          order.items?.some((x: any) => x.type === "physical") && (
            <p className="form-feedback">
              Collection status: {order.fulfilment.replaceAll("-", " ")}. The
              PANS team will send an update when your order is ready.
            </p>
          )}
        {order.paymentStatus === "pending" && (
          <div className="record-actions">
            {order.checkoutURL && (
              <a className="btn-primary" href={order.checkoutURL}>
                Continue payment
              </a>
            )}
            <ActionButton
              action="verify-payment"
              data={{ reference: order.reference }}
            >
              Check payment status
            </ActionButton>
            <ActionButton
              action="cancel-order"
              data={{ id: order.id }}
              confirm="Cancel this unpaid order?"
            >
              Cancel order
            </ActionButton>
          </div>
        )}
      </div>
      <div className="section-actions">
        <Link className="quiet-link" href="/contact">
          Need help with this order?
        </Link>
      </div>
    </>
  );
}
