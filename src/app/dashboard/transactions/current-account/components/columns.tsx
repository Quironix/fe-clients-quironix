"use client";

import { Badge } from "@/app/dashboard/components/badge";
import { INVOICE_TYPES } from "@/app/dashboard/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { CornerDownRight } from "lucide-react";
import { AccountStatementRow } from "../services/types";

const ROW_TYPE_LABEL: Record<AccountStatementRow["row_type"], string> = {
  INVOICE: "Documento",
  APPLICATION: "Aplicación",
  PAYMENT_REMAINDER: "Pago sin conciliar",
};

const getDocumentTypeLabel = (type: string) =>
  INVOICE_TYPES.find((c) => c.types.find((t) => t.value === type))?.types.find(
    (t) => t.value === type
  )?.label ?? type;

const TypeCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const isChild = original.row_type === "APPLICATION";
  return (
    <div className={isChild ? "flex items-center gap-1.5 pl-6 text-muted-foreground" : ""}>
      {isChild && <CornerDownRight className="h-3.5 w-3.5 shrink-0" />}
      <span className="text-sm">{ROW_TYPE_LABEL[original.row_type]}</span>
    </div>
  );
};

const DocumentCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  if (original.row_type === "INVOICE") {
    return (
      <div className="font-medium">
        {getDocumentTypeLabel(original.document_type)} {original.number}
      </div>
    );
  }
  if (original.row_type === "PAYMENT_REMAINDER") {
    return <div className="text-muted-foreground">Pago</div>;
  }
  return <div className="pl-6 text-muted-foreground">—</div>;
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

const AppliedCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const applied =
    original.row_type === "INVOICE"
      ? original.amount - original.balance
      : original.row_type === "APPLICATION"
        ? original.amount_applied
        : original.payment_amount - original.remaining_balance;
  return <div>{formatNumber(applied)}</div>;
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

export const columns: ColumnDef<AccountStatementRow>[] = [
  {
    id: "row_type",
    header: "Tipo",
    cell: ({ row }) => <TypeCell row={row} />,
  },
  {
    id: "document",
    header: "Documento / Nº",
    cell: ({ row }) => <DocumentCell row={row} />,
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
    id: "applied",
    header: "Aplicado",
    cell: ({ row }) => <AppliedCell row={row} />,
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
