"use client";

import PrefetchedLinks from "@/components/dashboard/links/view-links/prefetched-links";
import { Switch } from "@/components/ui/switch";
import { useAtom } from "jotai";
import { showHideSearchAtom } from "@/lib/atoms/show-hide-search-panel-links";

export function GetLinks() {
  const [checked, setChecked] = useAtom(showHideSearchAtom);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 items-center justify-end mr-4 lg:mr-8">
        <span className="text-sm font-bold ">Search panel</span>
        <Switch
          checked={checked}
          onCheckedChange={() => setChecked(!checked)}
        />
      </div>

      <PrefetchedLinks />
    </div>
  );
}
