import React from "react";
import { cn } from "@/lib/utils";

const CustomScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden h-full w-full custom-scroll responsive-scroll-area",
      className
    )}
    {...props}
  >
    <div className="h-full w-full overflow-x-auto overflow-y-auto custom-scroll">
      <div className="flex flex-col min-w-0 lg:pr-4">{children}</div>
    </div>
  </div>
));

CustomScrollArea.displayName = "CustomScrollArea";

export { CustomScrollArea };
