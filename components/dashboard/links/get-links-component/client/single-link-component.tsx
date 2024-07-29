import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, Clipboard, LucideQrCode, Trash2, TagIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteLink } from "@/_actions/_links/delete-links";
import { SHORTENER_BASEURL } from "@/lib/URLs/shortener_base_url";
import Link from "next/link";
import TagsComponent from "@/components/dashboard/link-tags/tags-component";

interface LinkData {
  id: string;
  url_long: string;
  created_at: string;
}

interface Props {
  data: LinkData;
}

export default function SingleLinkComponent({ data }: Props) {
  const [showTags, setShowTags] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteLinkMutation = useMutation({
    mutationFn: () => deleteLink(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "Success",
        description: "Link deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SHORTENER_BASEURL + data.id);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  return (
    <div className="pr-8">
      <Card className="mb-6 border-muted border-2 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="flex lg:justify-between flex-col lg:flex-row space-y-4 lg:space-y-0 justify-center">
            <div className="select-text flex items-center text-base justify-center lg:justify-normal">
              <span className="hidden lg:block min-w-24">Short link:</span>
              <Link
                id="short link"
                href={SHORTENER_BASEURL + data.id}
                className=" text-swappy cursor-pointer hover:underline active:opacity-50 text-xl px-8"
              >
                {SHORTENER_BASEURL + data.id}
              </Link>
              <span className="sr-only">
                Short link: {SHORTENER_BASEURL + data.id}
              </span>
            </div>
            <div className="flex gap-4 px-4 lg:px-0 justify-center lg:justify-normal">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      <Clipboard className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted  p-1 rounded w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="font-semibold border"
                  >
                    <p>Copy to Clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted  p-1 rounded w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="font-semibold border"
                  >
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLinkMutation.mutate()}
                    >
                      <Trash2 className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted  p-1 rounded w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="font-semibold border"
                  >
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex pt-4 pb-2">
          <div className="font-semibold w-full select-text flex items-center text-sm text-wrap break-words overflow-hidden mb-2 lg:space-x-4 justify-center lg:justify-normal">
            <span className="hidden lg:block min-w-24">Destination:</span>
            <div className="select-text cursor-pointer hover:underline active:opacity-50 px-6 lg:px-4 line-clamp-1 overflow-hidden">
              {data.url_long}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardContent className="flex flex-col lg:flex-row items-center text-sm gap-12 py-2 my-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={() => setShowTags(!showTags)}
                className="flex justify-center h-8 items-center"
              >
                <div className="flex gap-2 justify-center items-center hover:text-swappy hover:underline font-semibold">
                  <TagIcon className="w-4 h-4" />
                  <span>Tags:</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="border font-semibold">
                <span className="flex flex-col">
                  <p>Click to {showTags ? "hide" : "show"} tags.</p>
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
        {showTags && (
          <CardContent>
            <Separator />
            <div className="pt-4">
              <TagsComponent linkId={data.id} />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
