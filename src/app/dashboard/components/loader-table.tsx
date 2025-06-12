import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const LoaderTable = ({ cols }: { cols: number }) => {
  return (
    <TableRow>
      <TableCell className="text-center h-full pt-5" colSpan={cols}>
        <div className="flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" /> Cargando...
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LoaderTable;
