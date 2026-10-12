import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "We could not find that Addis Eats page. Browse the menu instead.",
};

export default function NotFound() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-2" style={{ color: "var(--text-muted)" }}>The dish or page you were looking for does not exist.</p>
      <Link href="/menu" className="mt-4 inline-block underline" style={{ color: "var(--rust)" }}>
        Back to Menu
      </Link>
    </main>
  );
}