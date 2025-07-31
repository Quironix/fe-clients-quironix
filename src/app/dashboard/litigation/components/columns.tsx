"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";


import { Litigation } from "../types";
import LitigationDetail from "./modals/litigation-detail";
import LitigationEdit from "./modals/litigation-edit";
import NormalizeFormModals from "./modals/normalize-form-modals";

// Componente separado para manejar acciones y modales
const ActionsCell = ({ row }: { row: Row<Litigation> }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showNormalize, setShowNormalize] = useState(false);

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
          <DropdownMenuItem onClick={() => setShowDetail(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar factura
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowNormalize(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Normalizar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LitigationDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        litigation={litigation}
      />

      <LitigationEdit
        open={showEdit}
        onOpenChange={setShowEdit}
        litigation={litigation}
      />

      <NormalizeFormModals
        open={showNormalize}
        onOpenChange={setShowNormalize}
        litigation={litigation}
      />
    </>
  );
};


// Columnas de la tabla
export const columns: ColumnDef<Litigation>[] = [
  {
    accessorKey: "invoice_number",
    header: "N° Factura",
    cell: ({ row }) => <div className="font-medium">{row.getValue("invoice_number") || "-"}</div>,
  },
  {
    accessorKey: "debtor_name",
    header: "Deudor",
    cell: ({ row }) => <div className="font-medium">{row.getValue("debtor_name") || "-"}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Ingreso de litigio",
    cell: ({ row }) => <div>{row.getValue("created_at") || "-"}</div>,
  },
  {
    accessorKey: "client_code",
    header: "Días de disputa",
    cell: ({ row }) => <div>{row.getValue("client_code") || "-"}</div>,
  },
  {
    accessorKey: "dispute_amount",
    header: "Monto de litigio",
    cell: ({ row }) => {
      return <div className="truncate max-w-[150px]">{row.getValue("dispute_amount") || "-"}</div>;
    },
  },
  {
    accessorKey: "invoice_balance",
    header: "Saldo factura",
    cell: ({ row }) => {
      return <div className="truncate max-w-[150px]">{row.getValue("invoice_balance") || "-"}</div>;
    },
  },
  {
    accessorKey: "approver",
    header: "Aprobador",
    cell: ({ row }) => {
      const value = row.getValue("approver");
      return <div className="truncate max-w-[150px]">{row.getValue("approver") || "-"}</div>;
    },
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => {
      return <div className="truncate max-w-[150px]">{row.getValue("reason") || "-"}</div>;
    },
  },
  {
    accessorKey: "sub_reason",
    header: "Submotivo",
    cell: ({ row }) => {
      return <div className="truncate max-w-[150px]">{row.getValue("sub_reason") || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: "Acción",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
