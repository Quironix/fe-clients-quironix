import React from "react";
import { cn } from "@/lib/utils";

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        "peer-[.header-fixed]/header:mt-20 pr-2 overflow-y-auto overflow-x-hidden p-10",
        "py-4",
        fixed && "fixed-main flex grow flex-col overflow-hidden"
      )}
      {...props}
    />
  );
};

Main.displayName = "Main";
