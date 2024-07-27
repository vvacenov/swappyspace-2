import CreateLinksParentComponent from "@/components/dashboard/links/create-links-component/create-links-parent-component";
import GetLinksSSR from "@/components/dashboard/links/get-links-component/SSR-prefecth/get-links-ssr-component";
import { Suspense } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LinksPage() {
  return (
    <div>
      <ScrollArea className="h-[calc(100vh-152px)] rounded-md px-4 lg:px-8 hidden lg:flex">
        <CreateLinksParentComponent />
        <Suspense>
          <GetLinksSSR />
        </Suspense>
      </ScrollArea>
      <div className="lg:hidden flex flex-col">
        <CreateLinksParentComponent />
        <Suspense>
          <GetLinksSSR />
        </Suspense>
      </div>
    </div>
  );
}
