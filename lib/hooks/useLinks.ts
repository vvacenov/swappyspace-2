import { getLinks } from "@/_actions/_links/get-urls";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { linksFilterAtom } from "../atoms/search";

export default function usePrefetchedLinks() {
  const value = useAtomValue(linksFilterAtom);

  return useQuery({
    queryKey: ["links", value],
    queryFn: () => getLinks(value),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
  });
}
