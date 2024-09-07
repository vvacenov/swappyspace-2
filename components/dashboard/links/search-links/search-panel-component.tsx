import React, { useState } from "react";
import { useAtom } from "jotai";
import { Card, CardContent } from "@/components/ui/card";
import { useAllTags } from "@/lib/hooks/useTagsHook";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X, Check } from "lucide-react";
import { linksFilterAtom } from "@/lib/atoms/search";
import { LinksFilter } from "@/utils/types/types";
import { useQueryClient } from "@tanstack/react-query";

import { Switch } from "@/components/ui/switch";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SkeletonArmyTags } from "../Suspense/suspense-links";

// props for TagList component
interface TagListProps {
  tags: string[];
  selectedTags: string[];
  onTagChange: (tag: string) => void;
}

const TagList: React.FC<TagListProps> = React.memo(
  ({ tags, selectedTags, onTagChange }) => (
    <ul className="flex flex-col gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <div className="w-full py-1 px-4 bg-muted rounded text-sm">
            <div className="flex justify-between items-center">
              <p>{tag}</p>
              <Checkbox
                className="bg-muted text-swappy"
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => onTagChange(tag)}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
);

export default function SearchLinksPanel() {
  const { tags = [], isLoading, error } = useAllTags();
  const [filter, setFilter] = useAtom<LinksFilter>(linksFilterAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setAdvancedOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags || []);
  const [exactTags, setExactTags] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleApplyFilter = () => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      excat_tags: exactTags,
      tags: selectedTags,
    }));
    setIsOpen(false);
  };

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const revalidateAllTags = () => {
    queryClient.invalidateQueries({ queryKey: ["all-tags"] });
  };

  const handleClearTags = () => {
    setSelectedTags((prevTags) => (prevTags = []));
  };

  if (error)
    return (
      <div className=" flex items-center text-destructive text-xs px-4 h-[60px]">
        <p>Error loading tags: {error.message}</p>
      </div>
    );

  return (
    <Card className="max-w-full h-full py-4 px-6 flex items-center shadow-sm border-none">
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            revalidateAllTags();
          }
        }}
      >
        <DialogTrigger className="p-1 px-4 bg-muted rounded-md text-swappy font-semibold hover:text-primary text-sm flex gap-2 items-center justify-center">
          <p>Find by Tags</p>
          <Tag className="w-4 h-4" />
        </DialogTrigger>
        <DialogContent className="pt-12">
          <DialogTitle className="text-xl font-semibold mx-6 text-swappy">
            Find by tags
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription className="text-sm text-muted-foreground mx-6">
              Select tag(s) to filter your links.
            </DialogDescription>
          </VisuallyHidden>
          <CardContent className="flex w-full h-full flex-col items-center lg:items-start gap-6">
            <div className="w-full pr-6">
              <Input
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find a tag..."
              />
            </div>
            <ScrollArea className="h-[210px] w-full pr-6">
              {isLoading ? (
                <SkeletonArmyTags />
              ) : (
                <TagList
                  tags={filteredTags}
                  selectedTags={selectedTags}
                  onTagChange={handleTagChange}
                />
              )}
            </ScrollArea>
            <div className="text-xs text-muted-foreground w-full pr-6">
              <ScrollArea className="max-h-20">
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="bg-muted px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter className="w-full">
              <div className="w-full items-center flex justify-between lg:pr-6 sm:flex-row">
                <div className="flex gap-2 flex-col">
                  <Switch
                    checked={exactTags}
                    onCheckedChange={() => setExactTags(!exactTags)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {!exactTags
                      ? "Links with ANY of the tags"
                      : "Links must contain EVERY tag"}
                  </p>
                </div>
              </div>
            </DialogFooter>
            <div className="w-full flex items-center justify-between">
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  handleClearTags();
                }}
                className="cursor-pointer flex gap-1 items-center"
              >
                <X className="w-6 h-6" />
                <p>Clear all</p>
              </Button>

              <Button
                onClick={(event) => {
                  event.stopPropagation(), event.preventDefault();
                  handleApplyFilter();
                }}
                className={`  flex gap-1 mr-6  ${
                  selectedTags.length === 0 && "ml-auto"
                }`}
              >
                <Check className="w-6 h-6" />
                Apply
              </Button>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
