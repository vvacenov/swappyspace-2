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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { linksFilterAtom } from "@/lib/atoms/search";
import { LinksFilter } from "@/utils/types/types";
import { useQueryClient } from "@tanstack/react-query";
import TailwindSpinner from "@/components/ui/spinner/tailwind-spinner";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags || []);
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

  if (error)
    return (
      <p className="text-destructive text-xs">
        Error loading tags: {error.message}
      </p>
    );

  return (
    <Card className="max-w-full h-full py-4 px-6 mx-4 lg:ml-0 lg:mr-8 flex items-center">
      {isLoading ? (
        <TailwindSpinner />
      ) : (
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
            <p>Tags</p>
            <Tag className="w-4 h-4" />
          </DialogTrigger>
          <DialogContent className="pt-12">
            <CardContent className="flex w-full h-full flex-col items-center lg:items-start gap-6">
              <Input
                className="mr-12 ml-12 lg:ml-0 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tags..."
              />
              <ScrollArea className="h-[225px] w-full pr-6">
                <TagList
                  tags={filteredTags}
                  selectedTags={selectedTags}
                  onTagChange={handleTagChange}
                />
              </ScrollArea>
              <DialogFooter>
                <Button onClick={handleApplyFilter}>OK</Button>
              </DialogFooter>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
