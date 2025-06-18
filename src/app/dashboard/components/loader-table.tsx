import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const LoaderTable = ({ cols }: { cols: number }) => {
  const skeletonRows = Array.from({ length: 3 }, (_, index) => (
    <TableRow key={index}>
      {Array.from({ length: cols }, (_, colIndex) => (
        <TableCell key={colIndex} className="p-4">
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return <>{skeletonRows}</>;
};

export default LoaderTable;
