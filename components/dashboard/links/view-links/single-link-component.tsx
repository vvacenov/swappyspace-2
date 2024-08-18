import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { shortLinkAtom, shortlinkInitVal } from "@/lib/atoms/links";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Clipboard, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteLink } from "@/_actions/_links/delete-links";
import { SHORTENER_BASEURL } from "@/lib/URLs/shortener_base_url";
import Link from "next/link";
import TagsComponent from "@/components/dashboard/links/tags/tags-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LinkData {
  id: string;
  url_long: string;
  created_at: string;
}

interface Props {
  data: LinkData;
}

export default function SingleLinkComponent({ data }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [state, setState] = useAtom(shortLinkAtom);

  const deleteLinkMutation = useMutation({
    mutationFn: () => deleteLink(data.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["links"] });
      const previousLinks = queryClient.getQueryData<LinkData[]>(["links"]);
      queryClient.setQueryData<LinkData[]>(["links"], (old) =>
        old?.filter((link) => link.id !== data.id)
      );
      return { previousLinks };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<LinkData[]>(["links"], context?.previousLinks);
      toast({
        title: "Error",
        description: `Failed to delete link ${
          "swppy.io/" + data.id
        }. Please try again.`,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Link deleted successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    if (state.short_url === "swppy.io/" + data.id) {
      setState(shortlinkInitVal);
    }
    deleteLinkMutation.mutate();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SHORTENER_BASEURL + data.id);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  return (
    <div className="relative">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="w-full max-w-5xl mx-auto border-muted-foreground shadow-md text-muted-foreground">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="py-5">
              <CardTitle className="flex flex-col lg:flex-row lg:justify-between">
                <div className="flex items-center text-base justify-between w-full gap-6 flex-col lg:flex-row">
                  <div className="flex items-center w-full gap-6">
                    <span className="hidden lg:flex min-w-24">Short link:</span>
                    <Link
                      href={SHORTENER_BASEURL + data.id}
                      className="text-swappy cursor-pointer hover:underline active:opacity-50 text-xl"
                    >
                      {SHORTENER_BASEURL + data.id}
                    </Link>
                  </div>
                  <div className="flex gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink();
                            }}
                            className="hover:text-swappy active:opacity-50 cursor-pointer p-1 rounded w-10 h-10"
                          >
                            <Clipboard className="w-8 h-8" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="font-semibold border"
                        >
                          <p>Copy to Clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDeleteDialogOpen(true);
                            }}
                            className="hover:text-swappy active:opacity-50 cursor-pointer p-1 rounded w-10 h-10"
                          >
                            <Trash2 className="w-8 h-8" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="font-semibold border"
                        >
                          <p>Delete Link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-10 h-10 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-10 h-10 flex-shrink-0" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          {!isOpen && (
            <div className="flex px-6 py-4">
              <span className="text-sm text-muted-foreground select-text cursor-pointer hover:underline active:opacity-50 line-clamp-1 overflow-hidden">
                {data.url_long.trim()}
              </span>
            </div>
          )}
          <Separator />
          <CollapsibleContent>
            <CardContent className="pt-4 pb-2">
              <div className="font-semibold w-full select-text flex items-center text-sm text-wrap break-words overflow-hidden mb-2 lg:gap-6 justify-between lg:justify-normal ">
                <span className="hidden lg:block min-w-24">Destination:</span>
                <div className="select-text cursor-pointer hover:underline active:opacity-50 line-clamp-1 overflow-hidden flex-grow">
                  {data.url_long}
                </div>
              </div>
            </CardContent>
            <Separator />
            <CardContent className="flex flex-col lg:flex-row items-center text-sm gap-12 py-2 my-2">
              <TagsComponent linkId={data.id} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Please confirm</DialogTitle>
            <DialogDescription>
              Deleting this link will redirect to the{" "}
              <a className="text-swappy" href="https://swppy.io/not-found">
                Not Found page on Swppy.io.{" "}
              </a>
              This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
