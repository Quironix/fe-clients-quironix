"use client";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileContext } from "@/context/ProfileContext";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "../create/[[...params]]/components/steps/columns";
import { useDebtorsStore } from "../store";
import { Debtor } from "../types";
import { Debtors } from "./types";

const ListDebtors = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { session, profile } = useProfileContext();
  const { debtors, loading, error, fetchDebtors, deleteDebtor } =
    useDebtorsStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDebtors(session?.token, profile?.client?.id);
    }
  }, [session?.token, profile?.client?.id, fetchDebtors]);

  const handleAssignUser = (debtor: Debtors) => {
    console.log("Asignar usuario a:", debtor);
    // Aquí iría la lógica para asignar usuario
  };

  const handleEdit = (debtor: Debtors) => {
    router.push(`/dashboard/debtors/create?id=${debtor.id}`);
  };

  const handleDelete = async (debtor: Debtors) => {
    if (session?.token && profile?.client?.id) {
      try {
        await deleteDebtor(session.token, profile.client.id, debtor.id);
        toast.success("Deudor eliminado correctamente");
        fetchDebtors(session.token, profile.client.id);
      } catch (error) {
        toast.error("Error al eliminar deudor");
        console.error("Error al eliminar deudor:", error);
      }
    }
  };

  // Filtrar deudores basado en el término de búsqueda
  const filteredDebtors = useMemo(() => {
    if (!debtors) return [];

    return debtors.filter((debtor: Debtors) => {
      if (!searchTerm) return true;
      const searchTermLower = searchTerm.toLowerCase();
      return (
        debtor.dni?.dni?.toLowerCase().includes(searchTermLower) ||
        debtor.name?.toLowerCase().includes(searchTermLower) ||
        debtor.email?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [debtors, searchTerm]);

  // Cálculos de paginación
  const totalItems = filteredDebtors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDebtors = filteredDebtors.slice(startIndex, endIndex);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Función para generar números de página visibles
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots.filter(
      (item, index, arr) => arr.indexOf(item) === index
    );
  };

  // Mostrar loader mientras está cargando
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold">Lista de deudores</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader size={40} className="text-primary mb-4" />
            <p className="text-muted-foreground">Cargando deudores...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurre algún problema
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold">Lista de deudores</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-medium mb-2">
                Error al cargar los deudores
              </p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <Button
                onClick={() => {
                  if (session?.token && profile?.client?.id) {
                    fetchDebtors(session?.token, profile?.client?.id);
                  }
                }}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con buscador y controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-md font-bold">Lista de deudores</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Buscador */}
          <div className="w-80 max-w-md relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-white"
              placeholder="Buscar por DNI, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={debtors as Debtor[]}
        isLoading={loading}
        loadingComponent={<LoaderTable cols={7} />}
        emptyMessage="No se encontraron deudores"
        pageSize={15}
        pageSizeOptions={[15, 20, 25, 30, 40, 50]}
      />
    </div>
  );
};

export default ListDebtors;
