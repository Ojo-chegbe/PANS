import { getCMS } from "@/lib/payload";
import { validPaystackSignature } from "@/lib/security";
import { confirmPayment, reconcileRefund } from "@/services/commerce";
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 200000 || !validPaystackSignature(raw, request.headers))
    return new Response("Invalid signature", { status: 401 });
  try {
    const event = JSON.parse(raw);
    if (
      event.event === "charge.success" &&
      typeof event.data?.reference === "string"
    )
      await confirmPayment(await getCMS(), event.data.reference);
    if (event.event === "refund.processed" && event.data?.id)
      await reconcileRefund(await getCMS(), event.data.id);
    return Response.json({ received: true });
  } catch (error) {
    console.error("Payment webhook processing failed.");
    return new Response("Please retry", { status: 500 });
  }
}
