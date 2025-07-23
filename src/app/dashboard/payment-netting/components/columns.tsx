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
import { BankMovementStatusEnum, PaymentNetting } from "../types";

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

const getStatusBadge = (status: PaymentNetting["status"]) => {
  console.log(status);
  const statusConfig = {
    [BankMovementStatusEnum.PENDING]: {
      label: "Pendiente",
      variant: WARNING_CLASS as string,
    },
    [BankMovementStatusEnum.PROCESSED]: {
      label: "Procesado",
      variant: SUCCESS_CLASS as string,
    },
    [BankMovementStatusEnum.PAYMENT_CREATED]: {
      label: "Pago creado",
      variant: SUCCESS_CLASS as string,
    },
    [BankMovementStatusEnum.REJECTED]: {
      label: "Rechazado",
      variant: ERROR_CLASS as string,
    },
    [BankMovementStatusEnum.ELIMINATED]: {
      label: "Eliminado",
      variant: ERROR_CLASS as string,
    },
    [BankMovementStatusEnum.COMPENSATED]: {
      label: "Compensado",
      variant: SUCCESS_CLASS as string,
    },
    [BankMovementStatusEnum.REJECTED_DUPLICATE]: {
      label: "Rechazado duplicado",
      variant: ERROR_CLASS as string,
    },
    [BankMovementStatusEnum.ELIMINATED_NEGATIVE_AMOUNT]: {
      label: (
        <span className="flex items-center gap-1">
          <Trash className="h-3 w-3" />
          Monto negativo
        </span>
      ),
      variant: ERROR_CLASS as string,
    },
    [BankMovementStatusEnum.ELIMINATED_NO_TRACKING]: {
      label: (
        <span className="flex items-center gap-1">
          <Trash className="h-3 w-3" />
          Sin tracking
        </span>
      ),
      variant: ERROR_CLASS as string,
    },
    [BankMovementStatusEnum.MAINTAINED]: {
      label: "Mantenido",
      variant: SUCCESS_CLASS as string,
    },
  };

  const config = statusConfig[status] || {
    label: "Desconocido",
    variant: WARNING_CLASS as string,
  };

  return <Badge className={config.variant}>{config.label}</Badge>;
};

// Estado => status
// Importe => amount
// Banco => bank_information.bank
// Nº de cuenta => bank_information.account_number
// Código => Vacío
// Fecha => created_at
// Descripción => description
// Comentario => comment
// Acción ---

export const columns: ColumnDef<PaymentNetting>[] = [
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "amount",
    header: "Importe",
    cell: ({ row }) => (
      <div className="font-bold text-sm">
        {formatCurrency(row.getValue("amount"), "CLP")}
      </div>
    ),
  },
  {
    accessorKey: "bank",
    header: "Banco",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("bank")}</div>
    ),
  },
  {
    accessorKey: "account_number",
    header: "Nº de cuenta",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.getValue("account_number")}
      </div>
    ),
  },
  {
    id: "code",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original?.payment?.debtor?.name || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatDate(row.getValue("date"))}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("description")}
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
