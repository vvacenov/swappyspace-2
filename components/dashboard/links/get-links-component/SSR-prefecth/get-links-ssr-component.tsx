import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import PrefetchedLinks from "@/components/dashboard/links/get-links-component/client/prefetched-links-component";
import { getLinks } from "@/_actions/_links/get-urls";

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
