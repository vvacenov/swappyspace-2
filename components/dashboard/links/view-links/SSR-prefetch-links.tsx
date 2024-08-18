import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { getLinks } from "@/_actions/_links/get-urls";
import PrefetchedLinks from "./prefetched-links";

export default async function GetLinksSSR() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const links = await getLinks();
      return links.map((link) => ({ ...link }));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PrefetchedLinks />
    </HydrationBoundary>
  );
}
