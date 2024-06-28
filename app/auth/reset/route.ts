"use server";
import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import {
  SiteNavigation,
  ProtectedSiteNavigation,
} from "@/lib/site-navigation/site-navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code") ?? "";
  const redirectURL = ProtectedSiteNavigation._UPDATE_PASSWORD_;
  const redirectError = SiteNavigation.errorAuthCallbacks;

  const redirectTo = new URL(request.url);
  redirectTo.searchParams.delete("code");

  if (code && code !== "") {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectTo.pathname = redirectError;
      return NextResponse.redirect(redirectTo.toString());
    }
    if (data?.session && data?.user) {
      // Base64 enkodiranje koristeći code
      const encodedValue = btoa(code);

      redirectTo.pathname = redirectURL;
      redirectTo.searchParams.set("code", code);

      const response = NextResponse.redirect(redirectTo.toString());
      response.cookies.set("respw", encodedValue, {
        path: "/",
        maxAge: 60 * 15, // Kolačić vrijedi 15 minuta
      });

      return response;
    }
  }

  redirectTo.pathname = SiteNavigation.errorAuthCallbacks;
  return NextResponse.redirect(redirectTo.toString());
}
