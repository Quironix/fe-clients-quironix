"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DTE } from "../types";
export const columns: ColumnDef<DTE>[] = [
  {
    accessorKey: "number",
    header: "Número de Documento",
    cell: ({ row }) => {
      const number = row.getValue("number") as string;
      return <div className="font-medium">{number || "-"}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <div>{type || "-"}</div>;
    },
  },
  {
    accessorKey: "issue_date",
    header: "Fecha de Emisión",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string;
      if (!date) return <div>-</div>;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "due_date",
    header: "Fecha de Vencimiento",
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string;
      if (!date) return <div>-</div>;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      if (isNaN(amount)) return <div>-</div>;
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balance"));
      if (isNaN(balance)) return <div>-</div>;
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(balance);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <div className="flex justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(
                `/dashboard/transactions/dte/create?id=${row.original.id}`
              )
            }
            title="Editar"
            className="hover:bg-amber-500 hover:text-white text-primary"
          >
            <Edit />
          </Button>
          <DialogConfirm
            title="¿Eliminar deudor?"
            description={`¿Estás seguro que deseas eliminar el deudor "${row.original.number}"? Esta acción no se puede deshacer.`}
            triggerButton={
              <Button
                variant="ghost"
                size="icon"
                title="Eliminar"
                className="hover:bg-red-500 hover:text-white text-primary"
              >
                <Trash2 />
              </Button>
            }
            cancelButtonText="Cancelar"
            confirmButtonText="Sí, eliminar"
            onConfirm={() => console.log(row)}
            type="danger"
          />
        </div>
      );
    },
  },
];
