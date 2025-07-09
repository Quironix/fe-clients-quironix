"use client";
import { TruncatedTextTooltip } from "@/app/dashboard/components/truncated-text-tooltip";
import { ColumnsByClientType } from "@/app/dashboard/hooks/use-data-table-by-client-type";
import { formatDate } from "@/lib/utils";
import { Movement } from "../services/types";

export const columns: ColumnsByClientType<Movement>[] = [
  {
    accessorKey: "company.name",
    header: "Cliente",
    clientType: "FACTORING",
    cell: ({ row }) => {
      const company = row.original.company?.name as string | null;
      return <div className="text-center">{company || "-"}</div>;
    },
  },
  {
    accessorKey: "bank_information.bank",
    header: "Banco",
    clientType: "ANY",
    cell: ({ row }) => {
      const bank = row.original.bank_information.bank as string | null;
      return <div className="text-center">{bank || "-"}</div>;
    },
  },
  {
    accessorKey: "bank_information.account_number",
    header: "Cuenta corriente",
    clientType: "ANY",
    cell: ({ row }) => {
      const account_number = row.original.bank_information.account_number as
        | string
        | null;
      return <div className="text-center">{account_number || "-"}</div>;
    },
  },
  {
    accessorKey: "movement_date",
    header: "Fecha Movimiento",
    clientType: "ANY",
    cell: ({ row }) => {
      const movement_date = row.getValue("movement_date") as string | null;
      if (!movement_date) return <div>-</div>;
      return <div className="text-center">{formatDate(movement_date)}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    clientType: "ANY",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="text-center">
          <TruncatedTextTooltip
            text={description || "-"}
            maxLength={30}
            className="text-center"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "movement_number",
    header: "Número movimiento",
    clientType: "ANY",
    cell: ({ row }) => {
      const movement_number = row.getValue("movement_number") as string | null;
      return <div className="text-center">{movement_number || "-"}</div>;
    },
  },
  {
    accessorKey: "square",
    header: "Sucursal",
    clientType: "ANY",
    cell: ({ row }) => {
      const square = row.getValue("square") as string | null;
      return <div className="text-center">{square || "-"}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Importe",
    clientType: "ANY",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
