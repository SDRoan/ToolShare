import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

function isProtectedListingPath(pathname: string) {
  return pathname === "/listings/new" || /^\/listings\/[^/]+$/.test(pathname) || /^\/listings\/[^/]+\/edit$/.test(pathname);
}

function isProtectedBrowsePath(pathname: string) {
  return pathname === "/browse" || /^\/requests\/[^/]+$/.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const needsAuth = pathname.startsWith("/dashboard") || isProtectedListingPath(pathname) || isProtectedBrowsePath(pathname);

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/browse", "/dashboard/:path*", "/listings/:id", "/listings/new", "/listings/:id/edit", "/requests/:id", "/login", "/signup"]
};
