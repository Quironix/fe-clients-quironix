import { formatDate, formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import DocumentTypeBadge from "../../payment-netting/components/document-type-badge";
import { Invoice } from "../types";

export const ColumnsDetail = (): ColumnDef<Invoice>[] => [
  {
    accessorKey: "number",
    header: "N° documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.number}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {<DocumentTypeBadge type={row.original.type} />}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatNumber(Number(row.original.amount))}
      </div>
    ),
  },
  {
    accessorKey: "due_date",
    header: "Vencimiento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatDate(row.original.due_date)}
      </div>
    ),
  },
  {
    accessorKey: "phases",
    header: "Fase",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.phases[row.original.phases.length - 1]?.phase || "1"}
      </div>
    ),
  },
  //   {
  //     accessorKey: "debtor_id",
  //     header: "Documento",
  //     cell: ({ row }) => (
  //       <div className="font-medium text-sm">{row.original.debtor.name}</div>
  //     ),
  //   },
  //   {
  //     accessorKey: "amount",
  //     header: "Monto",
  //     cell: ({ row }) => (
  //       <div className="font-medium text-sm">{row.original.debtor.name}</div>
  //     ),
  //   },
  //   {
  //     accessorKey: "due_date",
  //     header: "Vencimiento",
  //     cell: ({ row }) => (
  //       <div className="font-medium text-sm">{row.original.}</div>
  //     ),
  //   },
  //   {
  //     accessorKey: "phases",
  //     header: "Fase",
  //     cell: ({ row }) => (
  //       <div className="font-medium text-sm">{row.original.phases[row.original.phases.length - 1].due_date}</div>
  //     ),
  //   },
];
