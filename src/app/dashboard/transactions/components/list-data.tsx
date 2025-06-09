"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import {
  DataTable,
  TableAction,
  TableColumn,
} from "@/components/ui/data-table";
import { useProfileContext } from "@/context/ProfileContext";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useDTEStore } from "../dte/store";
import { DTE } from "../dte/types";

const ListDataDTE = () => {
  const router = useRouter();
  const { session, profile } = useProfileContext();
  const { dte, loading, error, fetchDTE, deleteDTE } = useDTEStore();

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDTE(session?.token, profile?.client?.id);
    }
  }, [session?.token, profile?.client?.id, fetchDTE]);

  // Configuración de columnas
  const columns: TableColumn<any>[] = useMemo(
    () => [
      {
        key: "number",
        header: "Número",
        accessor: (dte) => dte.number || "-",
      },
      {
        key: "external_number",
        header: "Número externo",
        accessor: (dte) => dte.external_number || "-",
      },
      {
        key: "order_number",
        header: "Número de orden",
        accessor: (dte) => dte.order_number || "-",
      },
    ],
    []
  );

  // Configuración de acciones
  const actions: TableAction<DTE>[] = useMemo(
    () => [
      {
        key: "assign",
        label: "Asignar usuario",
        icon: <UserPlus />,
        onClick: (dte) => {
          console.log("Asignar usuario a:", dte);
          // Aquí iría la lógica para asignar usuario
        },
        disabled: () => true, // Deshabilitado como en el original
        className: "hover:bg-blue-500 hover:text-white text-primary",
      },
      {
        key: "edit",
        label: "Editar",
        icon: <Edit />,
        onClick: (dte) => {
          console.log("Editar DTE:", dte);
          router.push(`/dashboard/transactions/dte/create?id=${dte.number}`);
        },
        className: "hover:bg-amber-500 hover:text-white text-primary",
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: <Trash2 />,
        onClick: () => {}, // Se maneja en el componente personalizado
        component: (dte) => (
          <DialogConfirm
            title="¿Eliminar DTE?"
            description={`¿Estás seguro que deseas eliminar el DTE "${dte.number}"? Esta acción no se puede deshacer.`}
            triggerButton={
              <button
                title="Eliminar"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-500 hover:text-white text-primary hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
            cancelButtonText="Cancelar"
            confirmButtonText="Sí, eliminar"
            onConfirm={() => handleDelete(dte)}
            type="danger"
          />
        ),
      },
    ],
    [router]
  );

  // Manejador de eliminación
  const handleDelete = async (dte: DTE) => {
    if (session?.token && profile?.client?.id) {
      try {
        await deleteDTE(session.token, profile.client.id, dte.number);
        toast.success("DTE eliminado correctamente");
        fetchDTE(session.token, profile.client.id);
      } catch (error) {
        toast.error("Error al eliminar DTE");
        console.error("Error al eliminar DTE:", error);
      }
    }
  };

  // Manejador de actualización
  const handleRefresh = () => {
    if (session?.token && profile?.client?.id) {
      fetchDTE(session?.token, profile?.client?.id);
    }
  };

  return (
    <DataTable<DTE>
      data={dte}
      loading={loading}
      error={error}
      columns={columns}
      actions={actions}
      title="Lista de DTE"
      searchable={true}
      searchPlaceholder="Buscar por número."
      searchKeys={["number", "external_number", "order_number"]}
      pagination={true}
      initialItemsPerPage={10}
      itemsPerPageOptions={[5, 10, 20, 50]}
      onRefresh={handleRefresh}
      emptyMessage="No hay DTE disponibles"
      noResultsMessage="No se encontraron DTE que coincidan con la búsqueda"
    />
  );
};

export default ListDataDTE;
