import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import FavoritesList from "./FavoritesList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your favourite dishes",
  description: "See the Ethiopian dishes you have saved with Addis Eats.",
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/signin?next=/favorites");
  }

  return (
    <main className="page-shell">
      <p className="page-kicker">ADDIS EATS · YOUR PICKS</p>

      <div>
        <h1 className="page-title">My Favourites</h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          Your favourite dishes will appear here.
        </p>
        <FavoritesList />
      </div>
    </main>
  );
}