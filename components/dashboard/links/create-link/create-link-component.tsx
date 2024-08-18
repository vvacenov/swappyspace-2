"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TailwindSpinner from "@/components/ui/spinner/tailwind-spinner";
import { urlTest } from "@/lib/zod-schemas/url-zod-schema-simple";
import { createShortUrl } from "@/_actions/_links/create-short-url";
import CreateLinkInput from "./subcomponents/create-link-input";
import { useAtom } from "jotai";
import { shortLinkAtom, shortlinkInitVal } from "@/lib/atoms/links";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Clipboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TagsComponent from "../tags/tags-component";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = urlTest.extend({
  antibot: z.string(),
});

export default function CreateLinkComponent() {
  const [submitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [state, setState] = useAtom(shortLinkAtom);
  const [shouldReset, setShouldReset] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      long_url: "",
      antibot: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.antibot) {
      setError("Bots are not allowed!");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let testURL = values.long_url.trim();
    if (!/^https?:\/\//.test(testURL)) {
      testURL = `https://${testURL}`;
    }

    const formData = new FormData();
    formData.append("long_url", testURL);
    formData.append("antibot", values.antibot);
    const result = await createShortUrl(formData);

    if (result.error) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    } else {
      setIsSubmitting(false);
      setState({ created: true, short_url: result.message, long_url: testURL });
      queryClient.refetchQueries({ queryKey: ["links"] });
      return;
    }
  }

  function resetCreated() {
    setState(shortlinkInitVal);
    setShouldReset(true);
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

  return (
    <div>
      <Card className="p-4 lg:p-12 lg:pb-6 relative w-full max-w-5xl mx-auto shadow-md">
        {!state.created ? (
          <CardHeader>
            <div className="flex flex-col gap-4 lg:gap-8 items-center">
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="gap-4 flex flex-col items-center justify-center w-full"
                >
                  <div className="flex-grow w-full">
                    <CreateLinkInput
                      shouldReset={shouldReset}
                      setShouldReset={setShouldReset}
                    />
                  </div>

                  <Button
                    disabled={submitting}
                    type="submit"
                    className="w-full"
                  >
                    {!submitting ? (
                      <p className="">Create Short Link</p>
                    ) : (
                      <TailwindSpinner />
                    )}
                  </Button>
                </form>
              </FormProvider>
            </div>
          </CardHeader>
        ) : (
          <div>
            <X
              onClick={() => {
                resetCreated();
              }}
              className="absolute top-2 right-2 w-12 h-12 text-muted-foreground border-muted-foreground border rounded-full p-1 hover:bg-muted cursor-pointer"
            />
            <CardHeader>
              <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-4 lg:gap-8 items-center">
                <span className="font-semibold min-w-32 text-muted-foreground">
                  Short link:{" "}
                </span>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={"http://" + state.short_url}>
                          <Button className="select-text rounded-md text-background bg-swappy hover:bg-swappy/90 py-2 px-6 text-xl hover:underline w-60">
                            <span>{state.short_url}</span>
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="font-semibold bg-swappy text-background border-none"
                      >
                        <p>Go to the link destination</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="select-text bg-swappy hover:bg-swappy/90 py-2 px-4 text-background"
                          onClick={handleCopyLink}
                          aria-label="Copy to clipboard"
                        >
                          <div>
                            <Clipboard />
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="font-semibold bg-swappy text-background border-none"
                      >
                        <p>Copy to Clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="px-6 py-0">
              <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-4 lg:gap-8 items-center py-8">
                <span className="font-semibold min-w-32 text-muted-foreground">
                  Destination:
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground lg:line-clamp-1 line-clamp-3 text-base overflow-hidden max-w-full hover:underline underline-offset-4 cursor-pointer font-semibold">
                        {state.long_url}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="font-semibold bg-secondary-foreground text-background border-none"
                    >
                      <p>Go to original link</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="py-12 rounded-xl mt-8 border-none w-full">
              <TagsComponent linkId={state.short_url} />
            </CardFooter>
          </div>
        )}

        {error && <p className="text-destructive m-2 text-sm">{error}</p>}
      </Card>
    </div>
  );
}
