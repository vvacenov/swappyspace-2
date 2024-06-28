import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import TailwindSpinner from "../ui/spinner/tailwind-spinner";
import dynamic from "next/dynamic";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";
const ThemedLogo = dynamic(
  () => import("../ui/themed-logo/logo").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-[125px] h-[37px]">
        <TailwindSpinner />
      </div>
    ), // Dodan fallback spinner dok se komponenta učitava
  }
);
import Link from "next/link";

export default function EmailSentComponent() {
  return (
    <Card className="w-full  flex flex-col justify-between  items-center text-sm shadow h-auto">
      <CardHeader>
        <span className="text-lg font-semibold">Your account was created.</span>
      </CardHeader>
      <CardContent>
        <CardHeader className="w-full ">
          <div className="p-4 text-white bg-swappy w-full rounded-md shadow-sm  flex items-center justify-center h-16">
            <CardTitle>Check your email</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <span className="p-4 font-semibold w-full rounded-md shadow-sm  border-black flex flex-col items-center justify-center">
            <p>Before you begin using your account,</p>
            <p>you have to confirm your email address.</p>
          </span>
        </CardContent>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-center text-sm mt-6 mb-1">
          <Link
            className="items-center text-sm hover:underline pointer-cursor"
            href={SiteNavigation.home}
          >
            <ThemedLogo size={133} />
            <span>Return to Home Page</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
