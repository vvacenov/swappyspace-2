import { useQuery } from "@tanstack/react-query";
import { getTagsForLink } from "@/_actions/_links/manage-tags";

export function useTags(linkId: string) {
  const cleanLinkId = linkId.split("/").pop() || "";

  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tags", cleanLinkId],
    queryFn: () => getTagsForLink(cleanLinkId),
    staleTime: Infinity,
  });

  return { tags, isLoading, error };
}
