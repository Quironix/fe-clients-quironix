import { Skeleton } from "@/components/ui/skeleton";
import { TableCell } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";
import React from "react";

const LoaderTable = ({ cols }: { cols: number }) => {
  return (
    <TableRow>
      <TableCell className="text-center h-full pt-5" colSpan={cols}>
        <div className="flex justify-center items-center gap-2">
          <Loader className="w-6 h-6 animate-spin" /> Cargando...
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LoaderTable;
