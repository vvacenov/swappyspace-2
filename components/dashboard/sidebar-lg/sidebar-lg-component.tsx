"use client";

import useUser from "@/lib/hooks/useUser";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Link as LinkIcon,
  QrCode,
  Images,
  Presentation,
  PieChart,
} from "lucide-react";

type Links = {
  name: string;
  href: string;
};

const sideBarLinks: Links[] = [
  { name: "Links", href: "/dashboard" },
  { name: "QR Codes", href: "/dashboard/qr-codes" },
  { name: "Collections", href: "/dashboard/collections" },
  { name: "Cards", href: "/dashboard/cards" },
];

const analyticsLinks: Links[] = [
  { name: "Analytics", href: "/dashboard/analytics" },
];

export function SidebarLg() {
  const { isFetching, data, error: fetchError } = useUser();
  const pathname = usePathname();

  return (
    <div className="w-full h-full select-none">
      <ul className="flex flex-col w-full gap-1 text-sm">
        {sideBarLinks.map((link) => (
          <Link key={link.name} className="w-full h-full" href={link.href}>
            <li
              className={`hover:bg-muted cursor-pointer p-2 rounded-md flex gap-2 items-center ${
                pathname === link.href
                  ? "underline bg-muted"
                  : "hover:bg-muted transition-all ease-in duration-100"
              }`}
            >
              <span className="text-swappy w-6 h-6">
                {link.name === "Links" && <LinkIcon />}
                {link.name === "QR Codes" && <QrCode />}
                {link.name === "Collections" && <Images />}
                {link.name === "Cards" && <Presentation />}
              </span>
              <span>{link.name}</span>
            </li>
          </Link>
        ))}
      </ul>
      <Separator className="my-2" />
      <ul className="flex flex-col w-full gap-1 text-sm">
        {analyticsLinks.map((link) => (
          <Link key={link.name} className="w-full h-full" href={link.href}>
            <li
              className={`hover:bg-muted cursor-pointer p-2 rounded-md flex gap-2 items-center ${
                pathname === link.href
                  ? "underline bg-muted"
                  : "hover:bg-muted transition-all ease-in duration-100"
              }`}
            >
              <span className="text-swappy w-6 h-6">
                {/* {link.name === "Links" && <LinkIcon />}
                {link.name === "QR Codes" && <QrCode />}
                {link.name === "Collections" && <Images />}
                {link.name === "Cards" && <Presentation />} */}
                {link.name === "Analytics" && <PieChart />}
              </span>
              <span>{link.name}</span>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
