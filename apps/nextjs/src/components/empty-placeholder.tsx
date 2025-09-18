import * as React from "react";

import { cn } from "@saasfly/ui";
import {
  Add,
  ArrowRight,
  Blocks,
  Billing,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cluster,
  Close,
  Copy,
  CopyDone,
  Dashboard,
  Ellipsis,
  Help,
  Heart,
  Key,
  Languages,
  Laptop,
  Logo,
  Menu,
  Moon,
  Organization,
  Page,
  Post,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Spinner,
  Sun,
  ThumbsUp,
  Trash,
  Twitter,
  User,
  Warning,
  System,
  Mdx,
  ClerkWide,
  TRPC,
  GitHub,
  Nextjs,
  Prisma,
  Kysely,
  Tailwind,
  Google,
} from "@saasfly/ui";

type EmptyPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

export function EmptyPlaceholder({
  className,
  children,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

interface EmptyPlaceholderIconProps
  extends Partial<React.SVGProps<SVGSVGElement>> {
  name: keyof typeof icons;
}

const icons = {
  Add,
  ArrowRight,
  Blocks,
  Billing,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cluster,
  Close,
  Copy,
  CopyDone,
  Dashboard,
  Ellipsis,
  Help,
  Heart,
  Key,
  Languages,
  Laptop,
  Logo,
  Menu,
  Moon,
  Organization,
  Page,
  Post,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Spinner,
  Sun,
  ThumbsUp,
  Trash,
  Twitter,
  User,
  Warning,
  System,
  Mdx,
  ClerkWide,
  TRPC,
  GitHub,
  Nextjs,
  Prisma,
  Kysely,
  Tailwind,
  Google,
};

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({
  name,
  className,
}: EmptyPlaceholderIconProps) {
  const Icon = icons[name];

  if (!Icon) {
    return null;
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <Icon className={cn("h-10 w-10", className)} />
    </div>
  );
};

type EmptyPlacholderTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({
  className,
  ...props
}: EmptyPlacholderTitleProps) {
  return (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2 className={cn("mt-6 text-xl font-semibold", className)} {...props} />
  );
};

type EmptyPlacholderDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlacholderDescriptionProps) {
  return (
    <p
      className={cn(
        "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
