import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public routes — always allowed
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/daftar") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    // If logged in and visiting /login, redirect to correct dashboard
    if (token && pathname === "/login") {
      const role = token.role as string;
      if (role === "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
      if (role === "guru") return NextResponse.redirect(new URL("/guru/dashboard", req.url));
      return NextResponse.redirect(new URL("/madrasah", req.url));
    }
    return NextResponse.next();
  }

  // Protected: /dashboard — admin only
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL(token.role === "guru" ? "/guru/dashboard" : "/madrasah", req.url));
    }
    return NextResponse.next();
  }

  // Protected: /madrasah — madrasah role only
  if (pathname.startsWith("/madrasah")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "madrasah") {
      return NextResponse.redirect(new URL(token.role === "guru" ? "/guru/dashboard" : "/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected: /guru — guru role only
  if (pathname.startsWith("/guru")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "guru") {
      return NextResponse.redirect(new URL(token.role === "admin" ? "/dashboard" : "/madrasah", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/madrasah/:path*", "/guru/:path*", "/login"],
};
