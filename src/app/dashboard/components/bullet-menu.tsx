"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import React from "react";

export interface BulletMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  component?: React.ReactNode;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface BulletMenuProps {
  items: BulletMenuItem[];
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export default function BulletMenu({
  items,
  className,
  triggerClassName,
  contentClassName,
  align = "end",
  side = "bottom",
  sideOffset = 4,
}: BulletMenuProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
            triggerClassName
          )}
        >
          <MoreVertical className="h-4 w-4 text-primary" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("w-auto min-w-[160px] p-1", contentClassName)}
      >
        {items.map((item) => {
          // Si el item tiene un component, lo renderizamos directamente
          if (item.component) {
            return (
              <div key={item.id} className="contents">
                {item.component}
              </div>
            );
          }

          // Si no tiene component, renderizamos el item normal
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
                item.variant === "destructive" &&
                  "text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
              )}
            >
              {item.icon && (
                <item.icon className="h-4 w-4 text-primary shrink-0" />
              )}
              <span className="whitespace-nowrap">{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
