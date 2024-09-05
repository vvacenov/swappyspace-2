"use client";

import { SkeletonArmy } from "@/components/dashboard/links/Suspense/suspense-links";
import usePrefetchedLinks from "@/lib/hooks/useLinks";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import SingleLinkComponent from "@/components/dashboard/links/view-links/single-link-component";
import { useAtomValue } from "jotai";
import { showHideSearchAtom } from "@/lib/atoms/show-hide-search-panel-links";
import SearchLinksPanel from "../search-links/search-panel-component";
import { linksFilterAtom } from "@/lib/atoms/search";

type Link = {
  id: string;
  url_long: string;
  created_at: string;
};

export default function PrefetchedLinks() {
  const { data, isLoading, error } = usePrefetchedLinks();
  console.log(data);

  const searchPanel = useAtomValue(showHideSearchAtom);
  const search = useAtomValue(linksFilterAtom);

  if (isLoading) {
    return (
      <>
        <CustomScrollArea className={"h-[calc(100vh-266px)]"}>
          <SkeletonArmy />
        </CustomScrollArea>
      </>
    );
  }

  if (error) {
    console.log(error);
    return (
      <>
        {searchPanel && <SearchLinksPanel />}
        <div className="flex items-center justify-center py-4">
          <p className="text-destructive text-xl">
            Error loading links. Please try again later.
          </p>
        </div>
      </>
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        {searchPanel && <SearchLinksPanel />}
        <div>
          {search.created_at ||
          search.id ||
          (search.tags?.length != undefined && search.tags.length > 0) ||
          search.url_long
            ? "No links found."
            : "Create your first link."}
        </div>
      </>
    );
  }

  if (data[0]?.id === "empty") {
    return (
      <>
        {searchPanel && <SearchLinksPanel />}
        <div>No links found.</div>
      </>
    );
  }

  return (
    <>
      {searchPanel && <SearchLinksPanel />}
      <CustomScrollArea
        className={
          !searchPanel ? `h-[calc(100vh-266px)]` : `h-[calc(100vh-456px)]`
        }
      >
        <div className="flex flex-col gap-8 pb-2">
          {data.map((link: Link) => (
            <SingleLinkComponent key={link.id} data={link} />
          ))}
        </div>
      </CustomScrollArea>
    </>
  );
}
