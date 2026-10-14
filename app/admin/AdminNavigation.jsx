"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "../actions/auth";
import ThemeToggle from "../components/ThemeToggle";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="admin-menu-toggle"
        aria-expanded={isOpen}
        aria-controls="admin-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">{isOpen ? "×" : "☰"}</span>
        <span>{isOpen ? "Close menu" : "Menu"}</span>
      </button>
      <aside
        id="admin-navigation"
        className={`admin-sidebar${isOpen ? " admin-sidebar-open" : ""}`}
      >
        <div className="admin-sidebar-heading">
          <span className="admin-sidebar-mark">AE</span>
          <span>
            <strong>Addis Eats</strong>
            <small>STAFF CONSOLE</small>
          </span>
        </div>
        <p className="admin-nav-label">WORKSPACE</p>
        <nav aria-label="Administration">
          {links.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-link${active ? " admin-nav-link-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                <span className="admin-nav-indicator" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-theme-row">
            <span className="admin-theme-label">Appearance</span>
            <ThemeToggle className="admin-theme-toggle" />
          </div>
          <Link href="/menu" className="admin-nav-link">
            <span className="admin-nav-indicator" aria-hidden="true" />
            Customer menu ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="admin-signout">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      {isOpen && (
        <button
          type="button"
          className="admin-nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
