"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { typeDocuments } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { Litigation } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AcctionsCellComponent = ({ row }: { row: Row<Litigation> }) => {
  const router = useRouter();

  const { session, profile } = useProfileContext();
  const [litigios, setLitigios] = useState([]);

  const fetchLitigios = async () => {
    const res = await fetch( `${API_URL}/v2/clients/${profile.clientId}/litigations`);
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
          router.push(`/dashboard/companies/create?id=${row.original.debtor_id}`)
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
      const invoiceNumber = row.getValue("invoice_number") as string;
      return <div className="font-medium">{invoiceNumber || "-"}</div>;
    },
    }, 
    {
        accessorKey: "document_type",
        header: "Documento",
        cell: ({ row }) => {
          const documentType = row.getValue("document_type") as string;
          return <div className="font-medium">{documentType || "-"}</div>;
        },
      }, 
  {
    accessorKey: "dispute_amount",
    header: "Monto de factura",
    cell: ({ row }) => {
      const category = row.getValue("dispute_amount") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "litigation_amount",
    header: "Monto litigio",
    cell: ({ row }) => {
      const category = row.getValue("litigation_amount") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  }
];
