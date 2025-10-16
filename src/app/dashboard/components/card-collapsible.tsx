"use client";

import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface CardCollapsibleProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  destacado?: boolean;
  className?: string;
}

export function CardCollapsible({
  icon,
  title,
  children,
  defaultOpen = false,
  destacado = false,
  className,
}: CardCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "bg-white p-2 rounded-md w-full h-full flex flex-col",
          destacado ? "border-2 border-blue-700" : "border border-gray-400",
        )}
      >
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              "flex justify-between items-center gap-1 text-blue-700",
            )}
          >
            <div className="flex justify-start items-center gap-1">
              <div className="flex-shrink-0">{icon}</div>
              <span className="text-sm font-semibold">{title}</span>
            </div>
            <IconChevronDown
              size={18}
              className={cn(
                "transition-transform duration-200",
                isOpen && "transform rotate-180",
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator className="my-2" />
          <div className="flex flex-col gap-2">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
