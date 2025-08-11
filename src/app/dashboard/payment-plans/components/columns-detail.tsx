import { ColumnDef } from "@tanstack/react-table";

export const ColumnsDetail = (): ColumnDef<{ id: string }>[] => [
  {
    accessorKey: "id",
    header: "N° documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.id}</div>
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
