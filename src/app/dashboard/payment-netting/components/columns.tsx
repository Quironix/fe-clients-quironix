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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeftRight,
  Eye,
  MessageCircle,
  MoreVertical,
  Trash,
} from "lucide-react";
import DialogConfirm from "../../components/dialog-confirm";
import { PaymentNetting } from "../types";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency === "CLP" ? "CLP" : "USD",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ERROR_CLASS =
  "bg-white border-red-500 rounded-md gap-2 text-red-500 text-[10px]";
const SUCCESS_CLASS =
  "bg-white border-green-600 rounded-md gap-2 text-green-600 text-[10px]";
const WARNING_CLASS =
  "bg-white border-orange-500 rounded-md gap-2 text-orange-500 text-[10px]";

const getStatusBadge = (status: PaymentNetting["status"]) => {
  console.log("status", status);
  const statusConfig = {
    PENDING: {
      label: "Pendiente",
      variant: WARNING_CLASS as string,
    },
    PROCESSED: {
      label: "Procesado",
      variant: SUCCESS_CLASS as string,
    },
    PAYMENT_CREATED: {
      label: "Pago creado",
      variant: SUCCESS_CLASS as string,
    },
    REJECTED: {
      label: "Rechazado",
      variant: ERROR_CLASS as string,
    },
    ELIMINATED: {
      label: "Eliminado",
      variant: ERROR_CLASS as string,
    },
    COMPENSATED: {
      label: "Compensado",
      variant: SUCCESS_CLASS as string,
    },
    REJECTED_DUPLICATE: {
      label: "Rechazado duplicado",
      variant: ERROR_CLASS as string,
    },
    MULTIPLE_SUGGESTIONS: {
      label: "Múltiples sugerencias",
      variant: WARNING_CLASS as string,
    },
    ELIMINATED_NEGATIVE_AMOUNT: {
      label: (
        <span className="flex items-center gap-1">
          <Trash className="h-3 w-3" />
          Monto negativo
        </span>
      ),
      variant: ERROR_CLASS as string,
    },
    ELIMINATED_NO_TRACKING: {
      label: (
        <span className="flex items-center gap-1">
          <Trash className="h-3 w-3" />
          Sin tracking
        </span>
      ),
      variant: ERROR_CLASS as string,
    },
    MAINTAINED: {
      label: "Mantenido",
      variant: SUCCESS_CLASS as string,
    },
  };

  const config = statusConfig[status] || {
    label: "Desconocido",
    variant: WARNING_CLASS as string,
  };

  return (
    <Badge className={cn("w-full min-w-[100px] p-0", config.variant)}>
      {config.label}
    </Badge>
  );
};

export const createColumns = (
  onViewDetails?: (transaction: PaymentNetting) => void,
  onReversePayment?: (transaction: PaymentNetting) => void
): ColumnDef<PaymentNetting>[] => [
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => getStatusBadge(row.original.status),
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
    header: "Código deudor",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original?.payment?.debtor?.debtor_code || "N/A"}
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
      <Popover>
        <div className="p-0 flex items-center gap-2">
          <PopoverTrigger className="cursor-pointer">
            <Eye className="h-4 w-4 text-blue-700" />
          </PopoverTrigger>
          <span className="max-w-[200px] truncate text-sm">
            {row.getValue("description")}
          </span>
        </div>
        <PopoverContent className="text-xs max-w-[400px] max-h-[300px] overflow-y-auto">
          {row.getValue("description")}
        </PopoverContent>
      </Popover>
    ),
  },
  {
    accessorKey: "comment",
    header: "Comentario",
    cell: ({ row }) =>
      row.getValue("comment") ? (
        <Popover>
          <div className="p-0 flex items-center gap-2">
            <PopoverTrigger className="cursor-pointer">
              <MessageCircle className="h-4 w-4 text-blue-700" />
            </PopoverTrigger>
            <span className="max-w-[200px] truncate text-sm">
              {row.getValue("comment")}
            </span>
          </div>
          <PopoverContent className="text-xs max-w-[400px] max-h-[300px] overflow-y-auto">
            {row.getValue("comment")}
          </PopoverContent>
        </Popover>
      ) : (
        "-"
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
            <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            {row.original.status === "COMPENSATED" && (
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <DialogConfirm
                  title="Reversar pago"
                  description="¿Estás seguro de querer reversar el pago?"
                  onConfirm={() => {
                    onReversePayment?.(row.original);
                  }}
                  triggerButton={
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Reversar
                    </div>
                  }
                  confirmButtonText="Reversar"
                  type="danger"
                />
              </DropdownMenuItem>
            )}
            {/*<DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const columns = createColumns();
