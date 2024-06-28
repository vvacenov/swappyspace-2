import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-center h-full">{children}</div>
    </section>
  );
}
