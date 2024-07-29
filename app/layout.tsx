// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider/theme-provider";
import { QueryProvider } from "../lib/react-query-provider/react-query-provider";
import { Toaster } from "@/components/ui/toaster";
import { Provider as JotaiAtomProvider } from "jotai";
import NavbarMainComponent from "@/components/navbar/navbar-main-component.tsx/navbar-main-component";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/hooks/authContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              <JotaiAtomProvider>
                <main className="relative">
                  <nav className="fixed z-10 top-0 left-0 right-0 overflow-hidden">
                    <NavbarMainComponent />
                  </nav>

                  <section className="z-0 flex overflow-clip min-h-[calc(100vh-112px)] mx-auto justify-center z-500 pt-24">
                    {children}
                    <Toaster />
                  </section>
                </main>
              </JotaiAtomProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
