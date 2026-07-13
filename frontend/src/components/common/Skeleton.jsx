import React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable layout skeleton placeholder for asynchronous component loading states.
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded bg-zinc-250/70", className)}
      {...props}
    />
  );
};

export default React.memo(Skeleton);
