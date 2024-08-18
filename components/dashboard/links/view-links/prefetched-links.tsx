"use client";

import { useQuery } from "@tanstack/react-query";
import { getLinks } from "@/_actions/_links/get-urls";
import SingleLinkComponent from "./single-link-component";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";

export default function PrefetchedLinks() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const links = await getLinks();
      return links.map((link) => ({ ...link }));
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return <div>{error.message || "Error loading links"}</div>;
  }

  if (!data || data.length === 0) {
    return <div>Create your first link</div>;
  }

  return (
    <CustomScrollArea className="h-[calc(100vh-226px)]">
      <div className="flex flex-col gap-8 pb-2">
        {data.map((link) => (
          <SingleLinkComponent key={link.id} data={link} />
        ))}
      </div>
    </CustomScrollArea>
  );
}
