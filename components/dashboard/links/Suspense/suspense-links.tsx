import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonArmy = () => {
  return (
    <div className="w-full max-w-5xl mx-auto max-h-[calc(100vh-226px)]">
      <div className="flex flex-col gap-8 pb-2 overflow-clip lg:pr-6">
        <Skeleton className="h-[250px] lg:h-[135px] lg:mr-4 w-full rounded-md" />
        <Skeleton className="h-[250px] lg:h-[135px] w-full rounded-md" />
        <Skeleton className="h-[250px] lg:h-[135px] w-full rounded-md" />
        <Skeleton className="h-[250px] lg:h-[135px] w-full rounded-md" />
        <Skeleton className="h-[250px] lg:h-[135px] w-full rounded-md" />
      </div>
    </div>
  );
};

export default function SuspenseLinks() {
  return <SkeletonArmy />;
}

export const SkeletonArmyTags = () => {
  return (
    <ul className="flex flex-col gap-2">
      <li>
        <Skeleton className="min-w-full min-h-[25px] rounded-md" />
      </li>
      <li>
        <Skeleton className="min-w-full min-h-[25px] rounded-md" />
      </li>
      <li>
        <Skeleton className="min-w-full min-h-[25px] rounded-md" />
      </li>
      <li>
        <Skeleton className="min-w-full min-h-[25px] rounded-md" />
      </li>
      <li>
        <Skeleton className="min-w-full min-h-[25px] rounded-md" />
      </li>
      <li>
        <Skeleton className="min-w-full min-h-[25px] rounded-md" />
      </li>
    </ul>
  );
};
