import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Forward the current pathname so not-found.tsx can log which URL triggered the 404
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // Re-inject Netlify geo headers explicitly so server components can read them reliably
  const ip =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.ip ??
    "unknown";
  requestHeaders.set("x-client-ip", ip);

  const country = request.headers.get("x-country") ?? request.geo?.country ?? "";
  if (country) requestHeaders.set("x-client-country", country);

  const city = request.geo?.city ?? "";
  if (city) requestHeaders.set("x-client-city", city);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
