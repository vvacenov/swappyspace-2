import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ProtectedSiteNavigation,
  baseUrl,
} from "@/lib/site-navigation/site-navigation";
import { UserResponse } from "@supabase/supabase-js";

export async function updateSession(request: NextRequest) {
  const protectedRoutes = Object.values(ProtectedSiteNavigation);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let user: null | UserResponse = null;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  user = await supabase.auth.getUser();

  const isProtectedPath = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (user.data && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isProtectedPath && user.error) {
    return NextResponse.redirect(new URL("/log-in", request.url));
  }

  return response;
}
