"use client";

import { Badge } from "@/app/dashboard/components/badge";
import { INVOICE_TYPES } from "@/app/dashboard/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { AccountStatementRow } from "../services/types";

const getDocumentTypeLabel = (type: string) =>
  INVOICE_TYPES.find((c) => c.types.find((t) => t.value === type))?.types.find(
    (t) => t.value === type
  )?.label ?? type;

const DebtorCell = ({ row }: { row: Row<AccountStatementRow> }) => (
  <div className="font-medium">
    {("debtor_name" in row.original && row.original.debtor_name) || "—"}
  </div>
);

const DocumentCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  if (original.row_type === "INVOICE") {
    return (
      <div>
        {getDocumentTypeLabel(original.document_type)} {original.number}
      </div>
    );
  }
  if (original.row_type === "PAYMENT_REMAINDER") {
    return <div className="text-muted-foreground">Pago</div>;
  }
  return (
    <div className="text-muted-foreground">
      {original.payment_number ? `Pago ${original.payment_number}` : "—"}
    </div>
  );
};

const OrderNumberCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const orderNumber = original.row_type === "INVOICE" ? original.order_number : null;
  return <div className="text-muted-foreground">{orderNumber || "—"}</div>;
};

const DateCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const date =
    original.row_type === "INVOICE"
      ? original.issue_date
      : original.row_type === "APPLICATION"
        ? original.applied_at
        : original.payment_date;
  if (!date) return <div>-</div>;
  return <div>{formatDate(date)}</div>;
};

const AmountCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const amount =
    original.row_type === "INVOICE"
      ? original.amount
      : original.row_type === "PAYMENT_REMAINDER"
        ? original.payment_amount
        : null;
  if (amount == null) return <div className="text-muted-foreground">—</div>;
  return <div>{formatNumber(amount)}</div>;
};

const BalanceCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const balance =
    original.row_type === "INVOICE"
      ? original.balance
      : original.row_type === "PAYMENT_REMAINDER"
        ? original.remaining_balance
        : null;
  if (balance == null) return <div className="text-muted-foreground">—</div>;
  return <div className="font-medium">{formatNumber(balance)}</div>;
};

const StatusCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  if (original.row_type === "APPLICATION") {
    return <div className="text-muted-foreground">—</div>;
  }
  const isOpen = original.status === "open";
  return (
    <Badge
      variant={isOpen ? "warning" : "success"}
      text={isOpen ? "Abierto" : "Cerrado"}
    />
  );
};

export const allDebtorsColumns: ColumnDef<AccountStatementRow>[] = [
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
