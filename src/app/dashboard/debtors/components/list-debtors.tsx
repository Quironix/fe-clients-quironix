"use client";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { useDebtors } from "@/hooks/useDebtors";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "../create/[[...params]]/components/steps/columns";
import { Debtor } from "../types";

const ListDebtors = () => {
  const { session, profile } = useProfileContext();

  // Usar el nuevo hook useDebtors con paginación del servidor
  const {
    debtors,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    handleSearchChange,
    currentPage,
    currentLimit,
    currentSearch,
    isSearching,
  } = useDebtors({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    initialPage: 1,
    initialLimit: 15,
  });

  if (isError) {
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
              <p className="text-red-500 text-sm mb-4">
                {error?.message || "Error desconocido"}
              </p>
              <Button
                onClick={() => refetch()}
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
      <DataTable
        columns={columns}
        data={debtors as Debtor[]}
        // Configuración para paginación del servidor (requerida)
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        isServerSideLoading={isLoading || isSearching}
        // Configuración de búsqueda
        enableGlobalFilter={true}
        searchPlaceholder="Buscar por DNI, nombre o email..."
        initialSearchValue={currentSearch}
        // Configuración de carga
        loadingComponent={<LoaderTable cols={7} />}
        emptyMessage="No se encontraron deudores"
        // Configuración de paginación
        pageSize={currentLimit}
        pageSizeOptions={[15, 20, 25, 30, 40, 50]}
      />
    </div>
  );
};

export default ListDebtors;
