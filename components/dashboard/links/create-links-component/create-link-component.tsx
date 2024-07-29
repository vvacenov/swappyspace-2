"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { urlTest } from "@/lib/zod-schemas/url-zod-schema-simple";
import {
  Form,
  FormControl,
  FormDescription,
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
import { createShortUrl } from "@/_actions/_links/create-short-url"; // Importiraj server akciju
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import TagsComponent from "../../link-tags/create-tags-component";
import { useState } from "react";

const formSchema = urlTest;

enum STATE_ACTIONS {
  SET_ERROR = "SET_ERROR",
  CLEAR_ERROR = "CLEAR_ERROR",
  SET_URLS = "SET_URLS",
  CLEAR_URLS = "CLEAR_URLS",
  SET_CREATING = "SET_CREATING",
  CLEAR_CREATING = "CLEAR_CREATING",

  RESET_STATE = "RESET_STATE",
}

type State = {
  error: string | null;
  long_url: string | null;
  short_url: string | null;
  is_creating_url: boolean;
};

type REDUCER_ACTION = {
  type: STATE_ACTIONS;
  payload?: Partial<State>;
};

interface LinksComponentProps {
  state: State;
  dispatch: React.Dispatch<REDUCER_ACTION>;
  setIsOpen: (value: boolean) => void;
}

export function CreateLinksComponent({
  state,
  dispatch,
  setIsOpen,
}: LinksComponentProps) {
  const queryClient = useQueryClient();
  const [creatingTags, setIsCreatingTags] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      long_url: "",
      antibot: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch({ type: STATE_ACTIONS.CLEAR_URLS });
    dispatch({ type: STATE_ACTIONS.SET_CREATING });

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

    const result = await createShortUrl(testURL);

    if (result.error) {
      dispatch({
        type: STATE_ACTIONS.SET_ERROR,
        payload: { error: result.message },
      });
      return;
    }

    dispatch({
      type: STATE_ACTIONS.SET_URLS,
      payload: { long_url: testURL, short_url: result.message },
    });
    dispatch({ type: STATE_ACTIONS.CLEAR_CREATING });
    dispatch({ type: STATE_ACTIONS.CLEAR_ERROR });
  }

  return (
    <div>
      {state.short_url ? (
        <Card className="min-h-48 md:w-full bg-slate-500/5 shadow-md">
          <CardHeader>
            <CardTitle className="flex lg:justify-between flex-col lg:flex-row space-y-4 lg:space-y-0 justify-center">
              <div className="select-text flex items-center text-base justify-center lg:justify-normal">
                <span className="hidden lg:block min-w-24">Short link:</span>
                <Link
                  id="short link"
                  href={"http://" + state.short_url}
                  className=" text-swappy cursor-pointer hover:underline active:opacity-50 text-xl px-8"
                >
                  {state.short_url}
                </Link>
                <span className="sr-only">Short link: {state.short_url}</span>
              </div>
              <div className="flex gap-4 px-4 lg:px-0 justify-center lg:justify-normal">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Clipboard className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted p-1 rounded w-9 h-9" />
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
                    <TooltipTrigger>
                      <Edit2 className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted  p-1 rounded w-9 h-9" />
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
                    <TooltipTrigger>
                      <Trash2 className="hover:text-swappy active:opacity-50 cursor-pointer bg-muted  p-1 rounded w-9 h-9" />
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
              <div className="max-w-[320px] lg:max-w-full select-text cursor-pointer hover:underline active:opacity-50 px-6 lg:px-4 line-clamp-2 lg:line-clamp-1 overflow-hidden">
                {state.long_url}
              </div>
            </div>
          </CardContent>

          <Separator />
          <CardContent className="flex flex-col lg:flex-row items-center text-sm gap-12 py-2 my-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <LucideQrCode className="w-16 h-16 p-2 bg-swappy/50 rounded-md hover:bg-swappy" />
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
                        onClick={() => setIsCreatingTags(!creatingTags)}
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
              <Separator />{" "}
              <div className="mt-8">
                <TagsComponent />
              </div>
            </CardContent>
          )}
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="long_url"
              render={({ field }) => (
                <FormItem>
                  <Label>Destination Link</Label>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        dispatch({ type: STATE_ACTIONS.CLEAR_ERROR });
                      }}
                      type="text"
                      className="bg-muted"
                      placeholder="https://"
                    />
                  </FormControl>

                  {form.formState.errors.long_url ? (
                    <FormMessage className="min-h-6 mt-1 text-swappy">
                      {form.formState.errors.long_url.message}
                    </FormMessage>
                  ) : state.error ? (
                    <FormMessage className="min-h-6 mt-1 text-swappy">
                      <p>{state.error}</p>
                    </FormMessage>
                  ) : (
                    <div className="min-h-6 mt-1 text-swappy"></div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="antibot"
              render={({ field }) => (
                <FormItem className="hidden">
                  <Label>Confirm</Label>
                  <FormControl>
                    <Input type="text" className="bg-muted" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">Hm...</FormDescription>
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
