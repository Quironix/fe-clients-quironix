import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { useDebtorsStore } from "@/app/dashboard/debtors/store";
import { Debtor } from "@/app/dashboard/debtors/types";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AcctionsCellComponent = ({ row }: { row: Row<Debtor> }) => {
  const router = useRouter();
  const { session, profile } = useProfileContext();
  const { deleteDebtor, fetchDebtors } = useDebtorsStore();

  const handleAssignUser = (debtor: Debtor) => {
    console.log("Asignar usuario a:", debtor);
    // Aquí iría la lógica para asignar usuario
  };
  const handleEdit = (debtor: Debtor) => {
    router.push(`/dashboard/debtors/create?id=${debtor.id}`);
  };

  const handleDelete = async (debtor: Debtor) => {
    if (session?.token && profile?.client?.id) {
      try {
        await deleteDebtor(
          session.token,
          profile.client.id,
          debtor.id as string
        );
        toast.success("Deudor eliminado correctamente");
        fetchDebtors(session.token, profile.client.id);
      } catch (error) {
        toast.error("Error al eliminar deudor");
        console.error("Error al eliminar deudor:", error);
      }
    }
  };

  return (
    <div className="flex justify-center gap-1">
      <Button
        disabled={true}
        variant="ghost"
        size="icon"
        onClick={() => console.log("Asignar usuario")}
        title="Asignar usuario"
        className="hover:bg-blue-500 hover:text-white text-primary"
      >
        <UserPlus />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEdit(row.original as Debtor)}
        title="Editar"
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title="¿Eliminar deudor?"
        description={`¿Estás seguro que deseas eliminar el deudor "${row.original.name}"? Esta acción no se puede deshacer.`}
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
        onConfirm={() => handleDelete(row.original as Debtor)}
        type="danger"
      />
    </div>
  );
};

export const columns: ColumnDef<Debtor>[] = [
  {
    accessorKey: "dni.dni",
    header: "DNI",
    cell: ({ row }) => {
      const debtor = row.original;
      const dni = debtor.dni?.dni;
      const type = debtor.dni?.type;
      return <div>{dni ? `${dni}` : "-"}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name || "-"}</div>;
    },
  },
  {
    accessorKey: "contacts.0.email",
    header: "Email",
    cell: ({ row }) => {
      const debtor = row.original;
      const email = debtor.contacts?.[0]?.email;
      return <div>{email || "-"}</div>;
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
