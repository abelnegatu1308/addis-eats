import { headers } from "next/headers";
import SiteHeader from "./SiteHeader";

export default async function SiteChrome({ children }) {
  const requestHeaders = await headers();
  const isAdmin = requestHeaders.get("x-addis-pathname")?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <SiteHeader />}
      {children}
      {!isAdmin && (
        <footer className="site-footer">
          <span>ADDIS EATS</span>
          <p>Authentic Ethiopian comfort, made for sharing.</p>
          <small>© 2026 Addis Eats</small>
        </footer>
      )}
    </>
  );
}
