import { Info } from "lucide-react";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const FormPopover = ({ description }: { description: string }) => {
  return (
    <div className="flex justify-start items-center gap-2">
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-4 h-4 text-orange-400" />
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FormPopover;
