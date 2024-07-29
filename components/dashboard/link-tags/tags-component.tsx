"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getTagsForLink, updateTags } from "@/_actions/_links/manage-tags";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 30;

const formSchema = z.object({
  tags: z.string().refine((val) => val.trim().length > 0, {
    message: "Tags cannot be empty",
  }),
});

interface TagsComponentProps {
  linkId: string;
}

export default function TagsComponent({ linkId }: TagsComponentProps) {
  const cleanLinkId = linkId.split("/").pop() || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: "",
    },
  });

  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tags", cleanLinkId],
    queryFn: () => getTagsForLink(cleanLinkId),
  });

  const updateTagsMutation = useMutation({
    mutationFn: (newTags: string[]) => updateTags(cleanLinkId, newTags),
    onMutate: async (newTags) => {
      await queryClient.cancelQueries({ queryKey: ["tags", cleanLinkId] });
      const previousTags = queryClient.getQueryData(["tags", cleanLinkId]);
      queryClient.setQueryData(["tags", cleanLinkId], newTags);
      return { previousTags };
    },
    onError: (err, newTags, context) => {
      queryClient.setQueryData(["tags", cleanLinkId], context?.previousTags);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update tags",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", cleanLinkId] });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newTags = values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const invalidTags = newTags.filter((tag) => tag.length > MAX_TAG_LENGTH);
    if (invalidTags.length > 0) {
      toast({
        title: "Error",
        description: `The following tags are too long (max ${MAX_TAG_LENGTH} characters): ${invalidTags.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    const duplicateTags = Array.from(
      new Set(newTags.filter((tag) => tags.includes(tag)))
    );
    if (duplicateTags.length > 0) {
      const message =
        duplicateTags.length === 1
          ? `The tag "${duplicateTags[0]}" already exists.`
          : `The following tags already exist: ${duplicateTags
              .map((tag) => `"${tag}"`)
              .join(", ")}`;

      toast({
        title: "Duplicate Tags",
        description: message,
        variant: "destructive",
      });
      return;
    }

    const uniqueNewTags = Array.from(new Set([...tags, ...newTags]));

    if (uniqueNewTags.length > MAX_TAGS) {
      toast({
        title: "Error",
        description: `You can only add up to ${MAX_TAGS} tags in total.`,
        variant: "destructive",
      });
      return;
    }

    updateTagsMutation.mutate(uniqueNewTags);
    form.reset();
  };
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    updateTagsMutation.mutate(newTags);
  };

  if (error) {
    toast({
      title: "Error",
      description:
        error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
  }

  const remainingTags = MAX_TAGS - tags.length;

  return (
    <div className="flex flex-col justify-center w-full space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-2 gap-8"
          aria-label="Tag input form"
        >
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  {remainingTags > 0 ? (
                    <Input
                      {...field}
                      placeholder={`Enter tags separated by commas (${remainingTags} left)`}
                      aria-label="Tag input"
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full p-2 bg-muted text-muted-foreground rounded-md">
                      5 tags reached. You can remove a tag to add a new one.
                    </div>
                  )}
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={updateTagsMutation.isPending || remainingTags === 0}
            className="w-full lg:w-auto"
          >
            <Tag className="mr-2 h-4 w-4" />
            {updateTagsMutation.isPending ? "Updating..." : "Add Tags"}
          </Button>
        </form>
      </Form>

      <div className="mt-4" aria-live="polite">
        {isLoading ? (
          <span className="text-sm text-muted-foreground">Loading tags...</span>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2" aria-label="Tag list">
            {tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs py-1 px-2"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tags added yet. You can add up to 5 tags for each link.
          </p>
        )}
      </div>
    </div>
  );
}
