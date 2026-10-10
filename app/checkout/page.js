import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details and place your Addis Eats order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await getSession();

  if (!session) {
    redirect("/signin?next=/checkout");
  }

  return (
    <main className="page-shell">
      <p className="page-kicker">
        THE ADDIS TABLE · 03
      </p>

      <div className="content-card">
        <h1>Checkout</h1>

        <p>
          Welcome, {session.name}. Complete your order
          and we will bring the warmth of the table to
          your door.
        </p>

        <CheckoutForm />
      </div>
    </main>
  );
}