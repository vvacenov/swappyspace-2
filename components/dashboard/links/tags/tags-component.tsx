"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTags } from "@/lib/hooks/useTagsHook";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  X,
  Tag,
  TagIcon,
  Save,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getTagsForLink, updateTags } from "@/_actions/_links/manage-tags";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import TailwindSpinner from "@/components/ui/spinner/tailwind-spinner";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 30;

const tagSchema = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(MAX_TAG_LENGTH, `Tag must be ${MAX_TAG_LENGTH} characters or less`)
  .regex(/^[a-zA-Z0-9]+$/, "Tag can only contain letters and numbers");

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
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { tags: "" },
  });

  const { tags, isLoading } = useTags(linkId);

  const updateTagsMutation = useMutation({
    mutationFn: (newTags: string[]) => updateTags(cleanLinkId, newTags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", cleanLinkId] });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Tags updated successfully",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update tags",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes to save.",
      });
      return;
    }
    try {
      await updateTagsMutation.mutateAsync(pendingTags);
    } catch (error) {
      toast({
        title: "Saving Tags Error",
        description: "Failed to update tags. Try again later",
        variant: "destructive",
      });
      console.error("Failed to update tags:", error);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newTags = values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const validationErrors: string[] = [];

    newTags.forEach((tag) => {
      try {
        tagSchema.parse(tag);
      } catch (error) {
        if (error instanceof z.ZodError) {
          validationErrors.push(`"${tag}": ${error.errors[0].message}`);
        }
      }
    });

    if (validationErrors.length > 0) {
      toast({
        title: "Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    const duplicateTags = newTags.filter((tag) => pendingTags.includes(tag));
    if (duplicateTags.length > 0) {
      const message =
        duplicateTags.length === 1
          ? `The tag "${duplicateTags[0]}" already exists in the list.`
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

    const updatedTags = [...pendingTags, ...newTags];

    if (updatedTags.length > MAX_TAGS) {
      toast({
        title: "Max Tags",
        description: `You can only add up to ${MAX_TAGS} tags in total.`,
        variant: "destructive",
      });
      return;
    }

    setPendingTags(updatedTags);
    form.reset();
  };

  const removeTag = (tagToRemove: string) => {
    setPendingTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  };

  const handleCancel = () => {
    setPendingTags(tags);
    setIsOpen(false);
  };

  const remainingTags = MAX_TAGS - pendingTags.length;
  const hasChanges = JSON.stringify(tags) !== JSON.stringify(pendingTags);

  useEffect(() => {
    if (!isLoading && tags) {
      setPendingTags(tags);
    }
  }, [tags, isLoading]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full text-muted-foreground"
    >
      <div className="flex items-center gap-4 flex-col lg:flex-row">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 flex gap-2 font-semibold text-base min-w-32"
          >
            <TagIcon className="h-6 w-6" />
            Tags
            {isOpen ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </Button>
        </CollapsibleTrigger>
        {!isOpen && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm py-1 px-3 border border-muted-foreground text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No tags</span>
            )}
          </div>
        )}
      </div>

      <CollapsibleContent className="mt-4 space-y-4">
        {isLoading ? (
          <Skeleton className="w-full h-10" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {pendingTags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm py-1 px-3 items-center justify-center border border-muted-foreground text-muted-foreground flex gap-2"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tag)}
                  className="ml-1 h-4 w-4 p-0  text-muted-foreground"
                >
                  <X className="min-h-6 min-w-6 hover:bg-destructive p-1 rounded-full hover:text-primary" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`Enter tags separated by commas (${remainingTags} left)`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={pendingTags.length >= MAX_TAGS}
              className="w-full "
            >
              <Tag className="mr-2 h-5 w-5 " />
              Add
            </Button>
          </form>
        </Form>

        <div className="flex justify-between lg:justify-end gap-4 mt-6">
          <Button onClick={handleCancel} variant="destructive" className="w-32">
            <XCircle className="mr-2 min-h-4 min-w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTagsMutation.isPending || !hasChanges}
            className="w-32 text-background bg-swappy hover:bg-swappy/90"
          >
            <Save className="mr-2 min-h-4 min-w-4 " />
            {updateTagsMutation.isPending ? <TailwindSpinner /> : "Save Tag(s)"}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
