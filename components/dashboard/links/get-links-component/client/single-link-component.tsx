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
import { Edit2, Clipboard, LucideQrCode, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface LinkData {
  id: string;
  url_long: string;
  created_at: string;
}
interface Props {
  data: LinkData;
}

export default function SingleLinkComponent({ data }: Props) {
  const queryClient = useQueryClient();
  return (
    <div className="pr-8">
      <Card className="h-36 mb-6  border-muted border-2 shadow-md">
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="flex justify-between">
            <div className="select-text flex  items-center text-base">
              <span className="hidden lg:block min-w-24">Short link:</span>
              <span className=" text-swappy cursor-pointer hover:underline active:opacity-50 text-xl px-8">
                {data.id}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex justify-between pt-2 pb-2">
          <div className="select-text flex items-center text-sm text-wrap break-words overflow-hidden mb-2 lg:space-x-4">
            <span className="hidden lg:block min-w-24">Destination:</span>
            <span className="select-text cursor-pointer hover:underline active:opacity-50 px-4 line-clamp-1">
              {data.url_long}
            </span>
          </div>
        </CardContent>

        <CardContent className="flex justify-between pt-2 pb-2">
          <div className="select-text flex items-center text-sm text-wrap break-words overflow-hidden mb-2 lg:space-x-4">
            <span className="hidden lg:block min-w-24">Date:</span>
            <span className="select-text cursor-pointer hover:underline active:opacity-50 px-4 line-clamp-1">
              {data.created_at}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
