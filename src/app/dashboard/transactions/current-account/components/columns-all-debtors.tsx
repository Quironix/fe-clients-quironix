"use client";

import { Badge } from "@/app/dashboard/components/badge";
import { INVOICE_TYPES } from "@/app/dashboard/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { AccountStatementRow } from "../services/types";

/**
 * QUI-17 — la ficha completa del documento en la grilla "Todos los deudores".
 *
 * Las 18 columnas del pedido (mas "OC", que ya existia y no se quita), cada una
 * encendible/apagable desde el selector de columnas. Los ids de las columnas que
 * ya existian se conservan tal cual — debtor, order_number, date, amount,
 * balance, status — para que la preferencia que un usuario ya tenia guardada
 * siga aplicando. La antigua "document" (tipo + numero juntos) se parte en
 * document_type y number, como pide §5.
 *
 * Una fila de pago no conciliado no es un documento: las columnas que no le
 * corresponden muestran "—", nunca un dato inventado.
 */

const getDocumentTypeLabel = (type: string) =>
  INVOICE_TYPES.find((c) => c.types.find((t) => t.value === type))?.types.find(
    (t) => t.value === type
  )?.label ?? type;

const Empty = () => <div className="text-muted-foreground">—</div>;

/** Solo las filas INVOICE tienen ficha de documento. */
const invoiceOnly = (
  row: Row<AccountStatementRow>,
  render: (
    original: Extract<AccountStatementRow, { row_type: "INVOICE" }>
  ) => React.ReactNode
) => {
  const original = row.original;
  if (original.row_type !== "INVOICE") return <Empty />;
  return render(original);
};

const text = (value?: string | null) =>
  value ? <div>{value}</div> : <Empty />;

const DebtorCell = ({ row }: { row: Row<AccountStatementRow> }) => (
  <div className="font-medium">
    {("debtor_name" in row.original && row.original.debtor_name) || "—"}
  </div>
);

const DebtorCodeCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  text("debtor_code" in row.original ? row.original.debtor_code : null);

const DebtorDniCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  text("debtor_dni" in row.original ? row.original.debtor_dni : null);

const AnalystCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  text("analyst_name" in row.original ? row.original.analyst_name : null);

const CompanyClientCodeCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => text(o.company_client_code));

const CompanyNameCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => text(o.company_name));

const DocumentTypeCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  if (original.row_type === "INVOICE") {
    return <div>{getDocumentTypeLabel(original.document_type)}</div>;
  }
  if (original.row_type === "PAYMENT_REMAINDER") {
    return <div className="text-muted-foreground">Pago</div>;
  }
  return <Empty />;
};

const NumberCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => <div>{o.number}</div>);

const OrderNumberCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => text(o.order_number));

const ExternalNumberCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => text(o.external_number));

/** "Fecha" de siempre: emision para documentos, recepcion para pagos. */
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

const DueDateCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) =>
    o.due_date ? <div>{formatDate(o.due_date)}</div> : <Empty />
  );

const CreatedAtCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) =>
    o.created_at ? <div>{formatDate(o.created_at)}</div> : <Empty />
  );

const AmountCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  const amount =
    original.row_type === "INVOICE"
      ? original.amount
      : original.row_type === "PAYMENT_REMAINDER"
        ? original.payment_amount
        : null;
  if (amount == null) return <Empty />;
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
  if (balance == null) return <Empty />;
  return <div className="font-medium">{formatNumber(balance)}</div>;
};

const DaysOverdueCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => {
    const days = o.days_overdue ?? 0;
    return (
      <div className={days > 0 ? "font-medium text-red-600" : ""}>{days}</div>
    );
  });

const PhaseCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) => text(o.phase_label));

const LitigationCell = ({ row }: { row: Row<AccountStatementRow> }) =>
  invoiceOnly(row, (o) =>
    o.has_open_litigation ? (
      <Badge variant="warning" text="Sí" />
    ) : (
      <div className="text-muted-foreground">No</div>
    )
  );

const StatusCell = ({ row }: { row: Row<AccountStatementRow> }) => {
  const original = row.original;
  if (original.row_type === "APPLICATION") return <Empty />;
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
    id: "company_client_code",
    header: "Código cliente",
    cell: ({ row }) => <CompanyClientCodeCell row={row} />,
  },
  {
    id: "company_name",
    header: "Razón social cliente",
    cell: ({ row }) => <CompanyNameCell row={row} />,
  },
  {
    id: "debtor_code",
    header: "Código deudor",
    cell: ({ row }) => <DebtorCodeCell row={row} />,
  },
  {
    id: "debtor",
    header: "Razón social deudor",
    cell: ({ row }) => <DebtorCell row={row} />,
  },
  {
    id: "debtor_dni",
    header: "RUT deudor",
    cell: ({ row }) => <DebtorDniCell row={row} />,
  },
  {
    id: "document_type",
    header: "Tipo de documento",
    cell: ({ row }) => <DocumentTypeCell row={row} />,
  },
  {
    id: "number",
    header: "Número de documento",
    cell: ({ row }) => <NumberCell row={row} />,
  },
  {
    id: "date",
    header: "Fecha emisión",
    cell: ({ row }) => <DateCell row={row} />,
  },
  {
    id: "due_date",
    header: "Fecha vencimiento",
    cell: ({ row }) => <DueDateCell row={row} />,
  },
  {
    id: "amount",
    header: "Monto documento",
    cell: ({ row }) => <AmountCell row={row} />,
  },
  {
    id: "balance",
    header: "Saldo documento",
    cell: ({ row }) => <BalanceCell row={row} />,
  },
  {
    id: "days_overdue",
    header: "Mora",
    cell: ({ row }) => <DaysOverdueCell row={row} />,
  },
  {
    id: "external_number",
    header: "Número interno",
    cell: ({ row }) => <ExternalNumberCell row={row} />,
  },
  {
    id: "order_number",
    header: "OC",
    cell: ({ row }) => <OrderNumberCell row={row} />,
  },
  {
    id: "phase",
    header: "Fase",
    cell: ({ row }) => <PhaseCell row={row} />,
  },
  {
    id: "analyst",
    header: "Analista",
    cell: ({ row }) => <AnalystCell row={row} />,
  },
  {
    id: "litigation",
    header: "Litigio",
    cell: ({ row }) => <LitigationCell row={row} />,
  },
  {
    id: "created_at",
    header: "Fecha de carga en sistema",
    cell: ({ row }) => <CreatedAtCell row={row} />,
  },
  {
    id: "status",
    header: "Estatus",
    cell: ({ row }) => <StatusCell row={row} />,
  },
];
