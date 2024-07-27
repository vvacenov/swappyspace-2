// pages/api/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
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
  matcher: ["/dashboard/:path*", "/a/update-password"],
};
