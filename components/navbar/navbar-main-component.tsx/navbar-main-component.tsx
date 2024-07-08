"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import Profile from "@/components/profile/profile-dropdown-component";
import BurgerMenu from "@/components/ui/burger-menu/burger-menu-component";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { useAuth } from "@/lib/hooks/authContext";

const ThemedLogo = dynamic(() => import("../../ui/themed-logo/logo"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[45px] w-[131.94px]">
      <Skeleton className="h-[32px] w-[131.94px] rounded" />
    </div>
  ),
});

type Links = {
  name: string;
  href: string;
};
const authLinks: Links[] = [
  { name: "Log in", href: "/log-in" },
  { name: "Free Sign up", href: "/sign-up" },
];
const linksLoggedIn: Links[] = [
  { name: "About", href: "/about" },
  { name: "Dashboard", href: "/dashboard" },
];
const linksLoggedOut: Links[] = [{ name: "About", href: "/about" }];

export default function NavbarMainComponent() {
  const { loggedIn, loading, error } = useAuth();
  const pathname = usePathname();

  const links = useMemo(
    () => (loggedIn ? linksLoggedIn : linksLoggedOut),
    [loggedIn]
  );

  return (
    <div className="border border-accent select-none w-full max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 lg:px-8 h-[104px] mb-2">
      <div className="flex items-center font-semibold w-full">
        <Link href="/">
          <div className="h-16 flex items-center justify-center">
            <ThemedLogo size={148} />
          </div>
        </Link>

        <div className="flex w-full justify-between">
          <ul className="lg:flex gap-x-4 ml-14 hidden items-center">
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className={`p-2 rounded-md ${
                    pathname === link.href
                      ? "underline bg-muted"
                      : "hover:bg-muted transition-all ease-in duration-100"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="lg:flex gap-x-4 ml-14 hidden items-center">
            {error && (
              <li>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="text-xl text-red-500" />
                  </HoverCardTrigger>
                  <HoverCardContent className="flex flex-col gap-3 text-sm">
                    <span>{error}</span>
                  </HoverCardContent>
                </HoverCard>
              </li>
            )}
            {loading ? (
              <div className="w-[194px] h-[40px]">
                <Skeleton className="h-[40px] w-full rounded" />
              </div>
            ) : !loggedIn ? (
              authLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className={`p-2 rounded-md ${
                      pathname === link.href
                        ? "underline  bg-muted"
                        : "hover:bg-muted transition-all ease-in duration-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="lg:flex justify-end items-center w-[191px] hidden ">
                <Profile />
              </li>
            )}
            <li>
              <ThemeToggle />
            </li>
          </ul>
          <ul className="flex gap-x-1 ml-14 lg:hidden items-center w-full">
            <li className="ml-auto">
              <BurgerMenu />
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
