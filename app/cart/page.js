import CartView from "./CartView";

export const metadata = {
  title: "Your cart",
  description: "Review the Ethiopian dishes you have picked before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main className="page-shell">
      <p className="page-kicker">THE ADDIS TABLE · 02</p>
      <CartView />
    </main>
  );
}