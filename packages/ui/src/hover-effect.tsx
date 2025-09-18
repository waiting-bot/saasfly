import * as React from "react";
import { cn } from "./utils/cn";

interface HoverEffectItem {
  title: string;
  description: string;
  link: string;
}

interface HoverEffectProps {
  items: HoverEffectItem[];
  className?: string;
}

const HoverEffect = React.forwardRef<
  HTMLDivElement,
  HoverEffectProps
>(({ items, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
      className
    )}
    {...props}
  >
    {items.map((item, index) => (
      <a
        key={index}
        href={item.link}
        className="group relative block p-6 h-full rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.description}
          </p>
        </div>
      </a>
    ))}
  </div>
));

HoverEffect.displayName = "HoverEffect";

export { HoverEffect };