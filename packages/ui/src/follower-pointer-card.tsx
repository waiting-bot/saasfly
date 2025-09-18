import * as React from "react";
import { cn } from "./utils/cn";

interface FollowerPointerCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  cardTitle?: React.ReactNode;
}

const FollowerPointerCard = React.forwardRef<
  HTMLDivElement,
  FollowerPointerCardProps
>(({ className, cardTitle, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative", className)}
    {...props}
  >
    {cardTitle && (
      <div className="absolute -top-6 left-0 text-sm font-medium text-gray-700">
        {cardTitle}
      </div>
    )}
    {children}
  </div>
));

FollowerPointerCard.displayName = "FollowerPointerCard";

export { FollowerPointerCard };