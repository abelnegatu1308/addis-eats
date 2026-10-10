import { NextResponse } from "next/server";

const SESSION_COOKIE = "addis-eats-session";

export function proxy(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-addis-pathname", request.nextUrl.pathname);

  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (session) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const signInUrl = new URL(isAdminRoute ? "/admin/login" : "/signin", request.url);

  if (!isAdminRoute) {
    signInUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
  }

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/favorites/:path*",
    "/kitchen/:path*",
  ],
};