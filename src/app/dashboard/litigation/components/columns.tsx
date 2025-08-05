"use client";

import { useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { Litigation } from "../types";
import LitigationDetail from "./modals/litigation-detail";
import NormalizeFormModals from "./modals/normalize-form-modals";
import LitigationEditModal from "./modals/litigation-edit";
import { formatDate } from "@/lib/utils";

const ActionsCell = ({ row }: { row: Row<Litigation> }) => {
  const [modalType, setModalType] = useState<"none" | "detail" | "edit" | "normalize">("none");
  const [selectedLitigation, setSelectedLitigation] = useState<Litigation | null>(null);

  const litigation = row.original;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setSelectedLitigation(litigation);
              setModalType("detail");
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedLitigation(litigation);
              setModalType("edit");
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar factura
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedLitigation(litigation);
              setModalType("normalize");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Normalizar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {modalType === "detail" && selectedLitigation && (
        <LitigationDetail
          open={true}
          litigation={selectedLitigation}
          onOpenChange={() => {
            setModalType("none");
            setSelectedLitigation(null);
          }}
        />
      )}

      {modalType === "edit" && selectedLitigation && (
        <LitigationEditModal
          open={true}
          litigation={selectedLitigation}
          onOpenChange={() => {
            setModalType("none");
            setSelectedLitigation(null);
          }}
        />
      )}

      {modalType === "normalize" && selectedLitigation && (
        <NormalizeFormModals
          open={true}
          litigation={selectedLitigation}
          onOpenChange={() => {
            setModalType("none");
            setSelectedLitigation(null);
          }}
        />
      )}
    </>
  );
};

// Columnas de la tabla con accessorFn en todas
export const columns: ColumnDef<Litigation>[] = [
  {
    accessorFn: (row) => row.invoice?.number || "-",
    id: "invoice_number",
    header: "N° Factura",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <div className="font-medium">{value}</div>;
    }
  },
  {
    accessorFn: (row) => row.debtor.name || "-",
    id: "debtor_name",
    header: "Deudor",
    cell: ({ getValue }) => <div className="font-medium">{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.creator.created_at || "-",
    id: "created_at",
    header: "Ingreso de litigio",
    cell: ({ getValue }) => <div>{formatDate(getValue<string>())}</div>,
  },
  {
    accessorFn: (row) => row.disputeDays|| "-",
    id: "dispute_days",
    header: "Días de disputa",
    cell: ({ getValue }) => <div>{getValue<string>()}</div>,
  },
  {
    accessorFn: (row) => row.litigation_amount || "-",
    id: "litigation_amount",
    header: "Monto de litigio",
    cell: ({ getValue }) => (
      <div className="truncate max-w-[150px]">{getValue<string>()}</div>
    ),
  },
  {
    accessorFn: (row) => row.invoice.balance || "-",
    id: "invoice_balance",
    header: "Saldo factura",
    cell: ({ getValue }) => (
      <div className="truncate max-w-[150px]">{getValue<string>()}</div>
    ),
  },
  {
    accessorFn: (row) => row.approver?.name || "-",
    id: "approver",
    header: "Aprobador",
    cell: ({ getValue }) => (
      <div className="truncate max-w-[150px]">{getValue<string>()}</div>
    ),
  },
  {
    accessorFn: (row) => row.motivo || "-",
    id: "reason",
    header: "Motivo",
    cell: ({ getValue }) => (
      <div className="truncate max-w-[150px] rounded-xl border border-green-700 bg-emerald-100 px-2 py-.5 text-xs">{getValue<string>()}</div>
    ),
  },
  {
    accessorFn: (row) => row.submotivo || "-",
    id: "submotivo",
    header: "Submotivo",
    cell: ({ getValue }) => (
      <div className="truncate max-w-[150px]">{getValue<string>()}</div>
    ),
  },
  {
    id: "actions",
    header: "Acción",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
