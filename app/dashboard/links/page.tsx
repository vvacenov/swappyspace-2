import CreateLinkComponent from "@/components/dashboard/links/create-link/create-link-component";
import SuspenseLinks from "@/components/dashboard/links/Suspense/suspense-links";
import GetLinksSSR from "@/components/dashboard/links/view-links/SSR-prefetch-links";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

export default function LinksPage() {
  return (
    <Tabs
      defaultValue="newLink"
      className="w-screen lg:w-full pt-6 px-2 md:px-8 lg:px-0"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="newLink">Create New Link</TabsTrigger>
        <TabsTrigger value="oldLinks">View Your Links</TabsTrigger>
      </TabsList>
      <TabsContent value="newLink">
        <CreateLinkComponent />
      </TabsContent>
      <TabsContent value="oldLinks">
        <Suspense fallback={<SuspenseLinks />}>
          <GetLinksSSR />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
