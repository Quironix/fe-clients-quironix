import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";
import { PaymentData } from "../types";

export const columns: ColumnDef<PaymentData>[] = [
  {
    accessorKey: "estado",
    header: "Estado",
    meta: { displayName: "Estado" },
    cell: ({ row }) => {
      const status = row.getValue("estado") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Conciliado"
              ? "bg-green-100 text-green-800"
              : status === "Pendiente"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "importe",
    header: "Importe",
    meta: { displayName: "Importe" },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("importe"));
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "banco",
    header: "Banco",
    meta: { displayName: "Banco" },
  },
  {
    accessorKey: "numeroCuenta",
    header: "Nº de cuenta",
    meta: { displayName: "Nº de cuenta" },
  },
  {
    accessorKey: "codigo",
    header: "Código",
    meta: { displayName: "Código" },
    cell: ({ row }) => {
      const code = row.getValue("codigo") as string;
      if (code === "No encontrado") {
        return (
          <div className="flex items-center">
            <span className="text-orange-600 mr-2">⚠️</span>
            <span className="text-orange-600">{code}</span>
          </div>
        );
      }
      return <span>{code}</span>;
    },
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    meta: { displayName: "Fecha" },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    meta: { displayName: "Descripción" },
  },
  {
    accessorKey: "comentario",
    header: "Comentario",
    meta: { displayName: "Comentario" },
  },
  {
    id: "action",
    header: "Acción",
    meta: { displayName: "Acción" },
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver</span>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
