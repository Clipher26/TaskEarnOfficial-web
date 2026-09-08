import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/auth", "/admin/login"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  const adminToken = request.cookies.get("admin_token")?.value;

  if (!token && !adminToken && !path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
