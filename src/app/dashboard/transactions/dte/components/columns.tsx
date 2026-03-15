"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { INVOICE_TYPES } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfileContext } from "@/context/ProfileContext";
import { formatDate } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, FileText, History, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDTEStore } from "../store";
import { DTE } from "../types";
import { useState } from "react";
import InvoiceHistoryModal from "./invoice-history-modal";

const DocumentCellComponent = ({ row }: { row: Row<DTE> }) => {
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  const file = row.original.file;
  const isValidUrl =
    typeof file === "string" &&
    (file.startsWith("http://") || file.startsWith("https://"));

  return (
    <div className="flex justify-center">
      {isValidUrl ? (
        <>
          <button
            type="button"
            onClick={() =>
              setPreviewFile({
                url: file,
                name: row.original.number || "Documento",
              })
            }
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <FileText className="w-5 h-5" />
          </button>
          <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
            <DialogContent className="max-w-[80vw]! h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {previewFile?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 px-6 pb-6 min-h-0">
                {previewFile?.url && (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                    className="w-full h-full rounded-md border border-gray-200"
                    title={`Preview ${previewFile.name}`}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <FileText className="w-5 h-5 text-gray-400 cursor-not-allowed" />
      )}
    </div>
  );
};

const AcctionsCellComponent = ({ row }: { row: Row<DTE> }) => {
  const router = useRouter();
  const { deleteDTE } = useDTEStore();
  const { session, profile } = useProfileContext();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const t = useTranslations("transactions.dte");
  const tCommon = useTranslations("common.buttons");

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsHistoryModalOpen(true)}
        title={t("viewHistory")}
        className="hover:bg-blue-500 hover:text-white text-primary"
      >
        <History />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(
            `/dashboard/transactions/dte/create?id=${row.original.id}`
          )
        }
        title={t("columnLabels.actions")}
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title={t("deleteTitle")}
        description={t("deleteDescription", { number: row.original.number })}
        triggerButton={
          <Button
            variant="ghost"
            size="icon"
            title={t("columnLabels.actions")}
            className="hover:bg-red-500 hover:text-white text-primary"
          >
            <Trash2 />
          </Button>
        }
        cancelButtonText={tCommon("cancel")}
        confirmButtonText={tCommon("yesDelete")}
        onConfirm={() => {
          if (session?.token && profile?.client?.id) {
            deleteDTE(session.token, profile.client.id, row.original.id!);
          }
        }}
        type="danger"
      />
      <InvoiceHistoryModal
        invoice={row.original}
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
      />
    </div>
  );
};

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
      const typeLabel = INVOICE_TYPES.find((t) =>
        t.types.find((t) => t.value === type)
      )?.types.find((t) => t.value === type)?.label;
      return <div>{typeLabel || "-"}</div>;
    },
  },
  {
    accessorKey: "issue_date",
    header: "Fecha de Emisión",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string;
      if (!date) return <div>-</div>;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "due_date",
    header: "Fecha de Vencimiento",
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string;
      if (!date) return <div>-</div>;
      return <div>{formatDate(date)}</div>;
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
    id: "document",
    header: "Documento",
    cell: ({ row }) => {
      return <DocumentCellComponent row={row} />;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return <AcctionsCellComponent row={row} />;
    },
  },
];
