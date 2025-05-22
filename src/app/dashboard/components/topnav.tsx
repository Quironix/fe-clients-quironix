"use client";
import React from "react";
import { TopNavProps } from "../interfaces";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { IconMenu } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TopNav = ({ className, links, ...props }: TopNavProps) => {
  return (
    <>
      <div className="md:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <IconMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {links.map(({ title, href, isActive, disabled }) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                <Link href={href} className={!isActive ? "text-muted-foreground" : ""}>
                  {title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn("hidden items-center space-x-4 md:flex lg:space-x-6", className)}
        {...props}
      >
        {links.map(({ title, href, isActive, disabled }) => (
          <Link
            key={`${title}-${href}`}
            href={href}
            className={`hover:text-primary text-sm font-medium transition-colors ${isActive ? "" : "text-muted-foreground"}`}
          >
            {title}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default TopNav;
