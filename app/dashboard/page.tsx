"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { PlusCircle, MinusCircle, ChevronDownSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import useUser from "@/lib/hooks/useUser";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { LinksComponent } from "@/components/dashboard/links-component/create-link-component";

export default function Dashboard() {
  const { isFetching, isError, data, error } = useUser();

  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapsible = () => {
    setIsOpen(!isOpen);
  };

  return (
    <section className="w-full h-full p-2">
      <Button
        onClick={toggleCollapsible}
        className="font-semibold flex gap-2 mb-8"
      >
        {!isOpen ? <PlusCircle /> : <MinusCircle />}
        <span>Create New Short link</span>
      </Button>
      <div className="mb-12">
        <Collapsible open={isOpen}>
          <CollapsibleContent>
            <LinksComponent />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
