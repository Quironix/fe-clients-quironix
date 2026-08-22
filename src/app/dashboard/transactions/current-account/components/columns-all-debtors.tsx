"use client";

import { Badge } from "@/app/dashboard/components/badge";
import { INVOICE_TYPES } from "@/app/dashboard/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { InvoiceStatementRow } from "../services/types";

const getDocumentTypeLabel = (type: string) =>
  INVOICE_TYPES.find((c) => c.types.find((t) => t.value === type))?.types.find(
    (t) => t.value === type
  )?.label ?? type;

const DebtorCell = ({ row }: { row: Row<InvoiceStatementRow> }) => (
  <div className="font-medium">{row.original.debtor_name || "—"}</div>
);

const DocumentCell = ({ row }: { row: Row<InvoiceStatementRow> }) => (
  <div>
    {getDocumentTypeLabel(row.original.document_type)} {row.original.number}
  </div>
);

const OrderNumberCell = ({ row }: { row: Row<InvoiceStatementRow> }) => (
  <div className="text-muted-foreground">{row.original.order_number || "—"}</div>
);

const DateCell = ({ row }: { row: Row<InvoiceStatementRow> }) =>
  row.original.issue_date ? (
    <div>{formatDate(row.original.issue_date)}</div>
  ) : (
    <div>-</div>
  );

const AmountCell = ({ row }: { row: Row<InvoiceStatementRow> }) => (
  <div>{formatNumber(row.original.amount)}</div>
);

const BalanceCell = ({ row }: { row: Row<InvoiceStatementRow> }) => (
  <div className="font-medium">{formatNumber(row.original.balance)}</div>
);

const StatusCell = ({ row }: { row: Row<InvoiceStatementRow> }) => {
  const isOpen = row.original.status === "open";
  return (
    <Badge
      variant={isOpen ? "warning" : "success"}
      text={isOpen ? "Abierto" : "Cerrado"}
    />
  );
};

export const allDebtorsColumns: ColumnDef<InvoiceStatementRow>[] = [
  {
    id: "debtor",
    header: "Deudor",
    cell: ({ row }) => <DebtorCell row={row} />,
  },
  {
    id: "document",
    header: "Documento / Nº",
    cell: ({ row }) => <DocumentCell row={row} />,
  },
  {
    id: "order_number",
    header: "OC",
    cell: ({ row }) => <OrderNumberCell row={row} />,
  },
  {
    id: "date",
    header: "Fecha",
    cell: ({ row }) => <DateCell row={row} />,
  },
  {
    id: "amount",
    header: "Monto",
    cell: ({ row }) => <AmountCell row={row} />,
  },
  {
    id: "balance",
    header: "Saldo",
    cell: ({ row }) => <BalanceCell row={row} />,
  },
  {
    id: "status",
    header: "Estatus",
    cell: ({ row }) => <StatusCell row={row} />,
  },
];
