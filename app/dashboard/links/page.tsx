import CreateLinksParentComponent from "@/components/dashboard/links/create-links-component/create-links-parent-component";
import GetLinksSSR from "@/components/dashboard/links/get-links-component/SSR-prefecth/get-links-ssr-component";
import { Suspense } from "react";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";

export default function LinksPage() {
  return (
    <div>
      <CustomScrollArea
        content="control"
        className="h-[calc(100vh-152px)] rounded-md"
      >
        <div className="pr-8">
          <CreateLinksParentComponent />
          <Suspense>
            <GetLinksSSR />
          </Suspense>
        </div>
      </CustomScrollArea>
    </div>
  );
}
