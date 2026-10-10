
import Link from "next/link";
import { CartCount } from "../providers";
import { getSession } from "@/lib/session";
import SignOutButton from "./SignOutButton";

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Addis Eats home"
        >
          <span className="brand-mark">AE</span>

          <span>
            <strong>Addis</strong>
            <small>EATS</small>
          </span>
        </Link>

        <nav
          className="site-nav"
          aria-label="Main navigation"
        >
          <Link href="/menu">Menu</Link>

          {session && (
            <>
              <Link href="/orders">Orders</Link>

              <Link href="/favorites">
                Favourites
              </Link>

              <Link href="/checkout">
                Checkout
              </Link>

              {session.role === "staff" && (
                <Link href="/kitchen">
                  Kitchen
                </Link>
              )}
            </>
          )}

          <Link
            href="/cart"
            className="nav-cart"
          >
            Cart <CartCount />
          </Link>

          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm sm:inline">
                Hi, {session.name}
              </span>

              <SignOutButton />
            </div>
          ) : (
            <Link href="/signin">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
