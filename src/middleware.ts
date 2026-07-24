import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  COMPANY: "/company/dashboard",
  CREATOR: "/creator/dashboard",
  ADMIN: "/admin/dashboard",
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) return NextResponse.next(); // handled by withAuth's authorized() below

    if (token.suspended) {
      return NextResponse.redirect(new URL("/auth?suspended=1", req.url));
    }

    // Authenticated via Google but hasn't chosen an account type yet.
    if (!token.role) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const role = token.role as string;
    const prefix = path.split("/")[1]; // "company" | "creator" | "admin"
    const expected = prefix === "company" ? "COMPANY" : prefix === "creator" ? "CREATOR" : prefix === "admin" ? "ADMIN" : null;

    if (expected && role !== expected) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/auth" },
  }
);

export const config = {
  matcher: ["/company/:path*", "/creator/:path*", "/admin/:path*"],
};
