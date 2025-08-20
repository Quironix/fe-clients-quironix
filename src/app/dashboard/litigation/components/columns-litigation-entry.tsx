"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DocumentTypeBadge from "../../payment-netting/components/document-type-badge";
import { Litigation } from "../types";
import { getMotivoLabel, getSubmotivoLabel } from "./columns";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AcctionsCellComponent = ({ row }: { row: Row<Litigation> }) => {
  const router = useRouter();

  const { session, profile } = useProfileContext();
  const [litigios, setLitigios] = useState([]);

  const fetchLitigios = async () => {
    const res = await fetch(
      `${API_URL}/v2/clients/${profile.clientId}/litigations`
    );
    const data = await res.json();
    setLitigios(data);
  };

  useEffect(() => {
    fetchLitigios();

    const handler = () => fetchLitigios();
    window.addEventListener("litigation:created", handler);

    return () => {
      window.removeEventListener("litigation:created", handler);
    };
  }, []);

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(
            `/dashboard/companies/create?id=${row.original.debtor_id}`
          )
        }
        title="Editar"
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title="¿Eliminar compañía?"
        description={`¿Estás seguro que deseas eliminar número factura "${row.original.invoice_number}"? Esta acción no se puede deshacer.`}
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
        onConfirm={() => {
          if (session?.token && profile?.client?.id) {
            // deleteCompany(session.token, profile.client.id, row.original.debtor_id!);
            toast.success("Compañía eliminada correctamente");
          }
        }}
        type="danger"
      />
    </div>
  );
};

export const columnsLitigationEntry: ColumnDef<Litigation>[] = [
  {
    accessorKey: "invoice_number",
    header: "Número",
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoice?.number as string;
      return <div className="font-medium">{invoiceNumber || "-"}</div>;
    },
  },
  {
    accessorKey: "document_type",
    header: "Documento",
    cell: ({ row }) => {
      const documentType = row.original.invoice?.type as string;
      return (
        <div className="font-medium">
          <DocumentTypeBadge type={documentType} />
        </div>
      );
    },
  },
  {
    accessorKey: "litigation_amount",
    header: "Monto litigio",
    cell: ({ row }) => {
      const category = row.getValue("litigation_amount") as string;

      const formattedAmount = new Intl.NumberFormat("es-CL", {
        style: "decimal",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(Number(category));
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {formattedAmount || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "motivo",
    header: "Motivo",
    cell: ({ row }) => {
      const category = row.getValue("motivo") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {getMotivoLabel(category) || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "submotivo",
    header: "Submotivo",
    cell: ({ row }) => {
      const category = row.getValue("submotivo") as string;
      const motivo = row.getValue("motivo") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {getSubmotivoLabel(motivo, category) || "-"}
        </div>
      );
    },
  },
];
