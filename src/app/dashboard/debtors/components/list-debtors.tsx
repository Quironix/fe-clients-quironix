"use client";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "../create/[[...params]]/components/steps/columns";
import { useDebtorsStore } from "../store";
import { Debtor } from "../types";

const ListDebtors = () => {
  const { session, profile } = useProfileContext();
  const { debtors, loading, error, fetchDebtors } = useDebtorsStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDebtors(session?.token, profile?.client?.id);
    }
  }, [session?.token, profile?.client?.id, fetchDebtors]);

  const customSearchFunction = (row: any, columnId: string, value: string) => {
    const searchTerm = value.toLowerCase();
    const rowData = row.original; // Acceder a los datos originales

    // Buscar en DNI
    const dni = rowData?.dni?.dni;
    if (dni && dni.toLowerCase().includes(searchTerm)) return true;

    // Buscar en nombre
    const name = rowData?.name;
    if (name && name.toLowerCase().includes(searchTerm)) return true;

    // Buscar en email
    const email = rowData?.contacts?.[0]?.email;
    if (email && email.toLowerCase().includes(searchTerm)) return true;

    return false;
  };

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
      <DataTable
        columns={columns}
        data={debtors as Debtor[]}
        isLoading={loading}
        loadingComponent={<LoaderTable cols={7} />}
        emptyMessage="No se encontraron deudores"
        enableGlobalFilter={true}
        searchPlaceholder="Buscar por DNI, nombre o email..."
        searchableColumns={["dni.dni", "name", "contacts.0.email"]}
        globalFilterFunction={customSearchFunction}
        pageSize={15}
        pageSizeOptions={[15, 20, 25, 30, 40, 50]}
      />
    </div>
  );
};

export default ListDebtors;
