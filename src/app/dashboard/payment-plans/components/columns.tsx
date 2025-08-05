"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreVertical, Trash, Trash2 } from "lucide-react";
import { BankMovementStatusEnum, PaymentPlans } from "../types";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency === "CLP" ? "CLP" : "USD",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

const ERROR_CLASS =
  "bg-white border-red-500 rounded-md gap-2 text-red-500 text-[10px]";
const SUCCESS_CLASS =
  "bg-white border-green-500 rounded-md gap-2 text-green-500 text-[10px]";
const WARNING_CLASS =
  "bg-white border-orange-500 rounded-md gap-2 text-orange-500 text-[10px]";

  const getStatusBadge = (status: PaymentPlans["status"]) => {
    const statusConfig = {
      [BankMovementStatusEnum.APPROVED]: {
        label: "Aprobado",
        variant: SUCCESS_CLASS,
      },
      [BankMovementStatusEnum.WITH_OBSERVATIONS]: {
        label: "Con observaciones",
        variant: WARNING_CLASS,
      },
      [BankMovementStatusEnum.REJECTED]: {
        label: "Rechazado",
        variant: ERROR_CLASS,
      },
      [BankMovementStatusEnum.IN_REVIEW]: {
        label: "En revisión",
        variant: WARNING_CLASS,
      },
    };
  
    const config = statusConfig[status];
    return <Badge className={config.variant}>{config.label}</Badge>;
  };
  

export const columns: ColumnDef<PaymentPlans>[] = [
  {
    accessorKey: "id",
    header: "N° de Solicitud",
    cell: ({ row }) => (
      <div className="font-bold text-sm">
        {formatCurrency(row.getValue("amount"), "CLP")}
      </div>
    ),
  },
  {
    accessorKey: "debtor",
    header: "Deudor",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("bank")}</div>
    ),
  },
   {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "account_number",
    header: "Deuda total",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.getValue("account_number")}
      </div>
    ),
  },
  {
    accessorKey: "installments_number",
    header: "N° Coutas",
    cell: ({ row }) => <div className="font-medium text-sm"> S/I</div>,
  },
  {
    accessorKey: "date",
    header: "Monto cuota",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatDate(row.getValue("date"))}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Inicio pago",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Término de pago",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("comment")}
      </div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Comentario",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("comment")}
      </div>
    ),
  },
  {
    accessorKey: "approver",
    header: "Aprobador",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("approver")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acción",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
