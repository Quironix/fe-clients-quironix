import { cn } from "@/lib/utils";
import React from "react";
import FintocConnectionAlert from "../banks/components/fintoc-connection-alert";

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, children, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        "peer-[.header-fixed]/header:mt-20 pr-2 overflow-x-hidden p-10",
        "py-4",
        fixed && "fixed-main flex grow flex-col overflow-hidden",
      )}
      {...props}
    >
      <FintocConnectionAlert />
      {children}
    </main>
  );
};

Main.displayName = "Main";
