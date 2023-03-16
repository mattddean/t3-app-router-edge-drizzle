"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";
import { cn } from "./lib/utils";

const DEFAULT_DELAY = 80;

const HoverCard: React.FC<HoverCardPrimitive.HoverCardProps> = (props) => {
  return <HoverCardPrimitive.Root openDelay={DEFAULT_DELAY} closeDelay={DEFAULT_DELAY} {...props} />;
};

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "animate-in zoom-in-90 z-50 w-64 rounded-md border border-slate-100 bg-white p-4 shadow-md outline-none dark:border-slate-800 dark:bg-slate-800",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
