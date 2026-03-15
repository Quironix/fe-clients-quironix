import { formatDate, formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import DocumentTypeBadge from "../../payment-netting/components/document-type-badge";
import { Invoice } from "../types";

export const ColumnsDetail = (
  t?: (key: string) => string
): ColumnDef<Invoice>[] => {
  const tr = t || ((key: string) => key);
  return [
    {
      accessorKey: "number",
      header: tr("columnHeaders.documentNumber"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.number}</div>
      ),
    },
    {
      accessorKey: "type",
      header: tr("columnHeaders.document"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {<DocumentTypeBadge type={row.original.type} />}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: tr("columnHeaders.amount"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {formatNumber(Number(row.original.amount))}
        </div>
      ),
    },
    {
      accessorKey: "due_date",
      header: tr("columnHeaders.dueDate"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {formatDate(row.original.due_date)}
        </div>
      ),
    },
    {
      accessorKey: "phases",
      header: tr("columnHeaders.phase"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.phases[row.original.phases.length - 1]?.phase || "1"}
        </div>
      ),
    },
  ];
};
