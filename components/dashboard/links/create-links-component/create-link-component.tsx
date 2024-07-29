"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { urlTest } from "@/lib/zod-schemas/url-zod-schema-simple";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clipboard, Edit2, Trash2, LucideQrCode, TagIcon } from "lucide-react";
import TailwindSpinner from "@/components/ui/spinner/tailwind-spinner";
import { createShortUrl } from "@/_actions/_links/create-short-url";
import Link from "next/link";
import TagsComponent from "@/components/dashboard/link-tags/tags-component";
import { useToast } from "@/components/ui/use-toast";
import { STATE_ACTIONS } from "@/components/dashboard/links/create-links-component/create-links-parent-component";

const formSchema = urlTest.extend({
  antibot: z.string(),
});

interface CreateLinksComponentProps {
  state: {
    error: string | null;
    long_url: string | null;
    short_url: string | null;
    is_creating_url: boolean;
  };
  dispatch: React.Dispatch<{
    type: STATE_ACTIONS;
    payload?: Partial<{
      error: string | null;
      long_url: string | null;
      short_url: string | null;
      is_creating_url: boolean;
    }>;
  }>;
  setIsOpen: (isOpen: boolean) => void;
  STATE_ACTIONS: typeof STATE_ACTIONS;
}

export function CreateLinksComponent({
  state,
  dispatch,
  setIsOpen,
  STATE_ACTIONS,
}: CreateLinksComponentProps) {
  const [creatingTags, setCreatingTags] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      long_url: "",
      antibot: "",
    },
  });

  const createUrlMutation = useMutation({
    mutationFn: createShortUrl,
    onSuccess: (data) => {
      dispatch({
        type: STATE_ACTIONS.SET_URLS,
        payload: {
          short_url: data.message,
          long_url: form.getValues().long_url,
        },
      });
    },
    onError: (error: Error) => {
      dispatch({
        type: STATE_ACTIONS.SET_ERROR,
        payload: { error: error.message },
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.antibot) {
      dispatch({
        type: STATE_ACTIONS.SET_ERROR,
        payload: { error: "Bots are not allowed." },
      });
      return;
    }

    let testURL = values.long_url.trim();
    if (!/^https?:\/\//.test(testURL)) {
      testURL = `https://${testURL}`;
    }

    dispatch({ type: STATE_ACTIONS.SET_CREATING });
    createUrlMutation.mutate(testURL);
  }

  const handleCopyLink = () => {
    if (state.short_url) {
      navigator.clipboard.writeText(state.short_url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
    }
  };

  const handleEdit = () => {
    // Implement edit functionality
    // This could open a modal or change the component state to allow editing
    console.log("Edit functionality not implemented yet");
  };

  const handleDelete = () => {
    dispatch({ type: STATE_ACTIONS.RESET_STATE });
    toast({
      title: "Deleted",
      description: "Link has been deleted.",
    });
  };

  return (
    <div>
      {state.short_url ? (
        <Card className="min-h-48 md:w-full bg-slate-500/5 shadow-md">
          <CardHeader>
            <CardTitle className="flex lg:justify-between flex-col lg:flex-row space-y-4 lg:space-y-0 justify-center">
              <div className="select-text flex items-center text-base justify-center lg:justify-normal">
                <span className="hidden lg:block min-w-24">Short link:</span>
                <Link
                  href={state.short_url}
                  className="text-swappy cursor-pointer hover:underline active:opacity-50 text-xl px-8"
                  aria-label={`Short link: ${state.short_url}`}
                >
                  {state.short_url}
                </Link>
              </div>
              <div className="flex gap-4 px-4 lg:px-0 justify-center lg:justify-normal">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyLink}
                        aria-label="Copy to clipboard"
                      >
                        <Clipboard className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted p-1 rounded w-9 h-9" />
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEdit}
                        aria-label="Edit link"
                      >
                        <Edit2 className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted p-1 rounded w-9 h-9" />
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
                        onClick={handleDelete}
                        aria-label="Delete link"
                      >
                        <Trash2 className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted p-1 rounded w-9 h-9" />
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
                {state.long_url}
              </div>
            </div>
          </CardContent>

          <Separator />
          <CardContent className="flex flex-col lg:flex-row items-center text-sm gap-12 py-2 my-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-16 h-16 p-2 bg-swappy/50 rounded-md hover:bg-swappy"
                    aria-label="Create QR Code"
                  >
                    <LucideQrCode className="w-12 h-12" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border font-semibold">
                  <p>Create a QR Code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-full flex justify-between">
              <div className="flex items-center flex-col lg:flex-row justify-between w-full">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        onClick={() => setCreatingTags(!creatingTags)}
                        className="flex justify-center h-8 items-center"
                      >
                        <div className="flex gap-2 justify-center items-center hover:text-swappy hover:underline font-semibold">
                          <TagIcon className="w-4 h-4" />
                          <span>Tags:</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="border font-semibold"
                      >
                        <span className="flex flex-col">
                          <p>Click to add tags.</p>
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardContent>
          {creatingTags && (
            <CardContent>
              <Separator />
              <div className="pt-4">
                <TagsComponent linkId={state.short_url} />
              </div>
            </CardContent>
          )}
          <Separator />
          <CardFooter className="flex items-center justify-center pt-4">
            <Button
              className="w-1/3"
              onClick={() => {
                dispatch({ type: STATE_ACTIONS.RESET_STATE });
                setIsOpen(false);
                queryClient.invalidateQueries({ queryKey: ["links"] });
              }}
            >
              Done
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="long_url"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="long_url">Destination Link</Label>
                  <FormControl>
                    <Input
                      {...field}
                      id="long_url"
                      type="text"
                      className="bg-muted"
                      placeholder="https://"
                      aria-describedby="long_url-error"
                    />
                  </FormControl>
                  <FormMessage id="long_url-error" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="antibot"
              render={({ field }) => (
                <FormItem className="hidden">
                  <Label htmlFor="antibot">Confirm</Label>
                  <FormControl>
                    <Input
                      {...field}
                      id="antibot"
                      type="text"
                      className="bg-muted"
                      aria-hidden="true"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              disabled={state.is_creating_url}
              type="submit"
              className="w-20"
            >
              {!state.is_creating_url ? <p>Submit</p> : <TailwindSpinner />}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
