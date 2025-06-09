"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Movement } from "../services/types";

export const columns: ColumnDef<Movement>[] = [
  {
    accessorKey: "amount",
    header: "Importe",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "bank_information.bank",
    header: "Banco",
    cell: ({ row }) => {
      return <div>{row.original.bank_information.bank}</div>;
    },
  },
  {
    accessorKey: "bank_information.account_number",
    header: "N° de cuenta",
    cell: ({ row }) => {
      return <div>{row.original.bank_information.account_number}</div>;
    },
  },
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ row }) => {
      const date = row.getValue("movement_date") as Date;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.getValue("description")}
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Comentario",
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string | null;
      return <div className="max-w-[150px] truncate">{comment || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end gap-2">
          {/* Aquí se pueden agregar botones de acciones como editar, eliminar, etc. */}
          <span className="text-sm text-gray-500">ACCIONES</span>
        </div>
      );
    },
  },
];
