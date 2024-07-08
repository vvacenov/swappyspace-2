// pages/api/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

import { rateLimiter } from "./lib/rate-limit/ratelimiter";

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.ip;

  if (!ip) {
    console.log("IP address not found");
    return NextResponse.json(
      { message: "Server error: IP address not found" },
      { status: 500 }
    );
  }

  const limit = await rateLimiter.limit(ip);

  console.log(limit.success);
  if (!limit.success) {
    throw new Error("too many requests");
  }

  if (request.nextUrl.pathname === "/a/update-password") {
    const changePwdCookie = request.cookies.get("respw")?.value;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") ?? "";

    if (!changePwdCookie || !code) {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }

    // Base64 dekodiranje
    const expectedValue = btoa(code);

    if (changePwdCookie !== expectedValue) {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/dashboard", "/a/update-password"],
};
