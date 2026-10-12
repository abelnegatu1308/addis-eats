import OrderStatus from "./OrderStatus";
import { redirect, notFound } from "next/navigation";
import { getOrderForOwner } from "@/lib/orders";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Order status",
  description: "View updates for your Addis Eats order.",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    redirect(`/signin?next=${encodeURIComponent(`/orders/${id}`)}`);
  }

  const order = await getOrderForOwner(id, session.id);
  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Addis Eats
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Order #{id}
        </h1>
      </div>

      <OrderStatus
        orderId={id}
        fallbackData={order}
      />
    </main>
  );
}