"use client";
import { useDocumentInfo, useAuth, useFormFields } from "@payloadcms/ui";
import { ActionButton } from "../ActionForm";
export function EventExport() {
  const { id } = useDocumentInfo();
  return id ? (
    <div style={{ padding: "16px 0" }}>
      <a
        href={
          "/api/export/registrations?event=" + encodeURIComponent(String(id))
        }
        target="_blank"
        rel="noreferrer"
      >
        Export event registrations as CSV
      </a>
    </div>
  ) : (
    <p>Save this event before exporting registrations.</p>
  );
}
export function OrderPaymentActions() {
  const { id } = useDocumentInfo();
  const { user } = useAuth();
  const status = useFormFields(([fields]) => fields.paymentStatus?.value);
  const total = useFormFields(([fields]) => fields.total?.value);
  if (
    !id ||
    !user?.roles?.includes("admin") ||
    status !== "paid" ||
    !Number(total)
  )
    return null;
  return (
    <div style={{ padding: "16px 0" }}>
      <ActionButton
        action="refund-order"
        data={{ id }}
        confirm="Issue a full refund for this order? The payment provider will process the refund."
        className="text-button"
      >
        Issue full refund
      </ActionButton>
    </div>
  );
}
