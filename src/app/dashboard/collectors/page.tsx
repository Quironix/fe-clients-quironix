"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Cog, Eye, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import DialogForm from "../components/dialog-form";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { createColumns } from "./components/columns";
import { useCollectors } from "./hooks/useCollectors";
import { deleteCollector, updateStatus } from "./services";
import { CollectorResponse } from "./services/types";

const CollectorsPage = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedCollector, setSelectedCollector] =
    useState<CollectorResponse | null>(null);
  const router = useRouter();
  const {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    handlePaginationChange,
    handleSearchChange,
    refetch,
    rowSelection,
    handleRowSelectionChange,
    isHydrated,
  } = useCollectors(session?.token, profile?.client_id, {});

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "name", is_visible: true },
    { name: "description", is_visible: true },
    { name: "frequency", is_visible: true },
    { name: "subject", is_visible: true },
    { name: "createdAt", is_visible: true },
    { name: "channel", is_visible: true },
    { name: "status", is_visible: true },
    { name: "actions", is_visible: true },
  ]);

  const columnVisibility = useMemo(() => {
    const visibility: VisibilityState = {};
    columnConfiguration.forEach((col) => {
      visibility[col.name] = col.is_visible;
    });
    return visibility;
  }, [columnConfiguration]);

  const columnLabels = useMemo(
    () => ({
      name: "Nombre",
      description: "Descripción",
      frequency: "Frecuencia",
      subject: "Asunto",
      createdAt: "Fecha Creación",
      channel: "Canales",
      status: "Estado",
      actions: "Acciones",
    }),
    []
  );

  const bulkActions = useMemo(
    () => [
      {
        label: "Ver detalles",
        onClick: (selectedRows: CollectorResponse[]) => {
          console.log(
            "Ver detalles de collectors seleccionados:",
            selectedRows
          );
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: "Eliminar",
        onClick: async (selectedRows: CollectorResponse[]) => {
          if (!session?.token || !profile?.client_id) return;

          try {
            for (const collector of selectedRows) {
              await deleteCollector(
                session.token,
                collector.id,
                profile.client_id
              );
            }
            toast.success("Collectors eliminados correctamente");
            refetch();
          } catch (error) {
            console.error("Error deleting collectors:", error);
            toast.error("Error al eliminar los collectors");
          }
        },
        variant: "destructive" as const,
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
    [session?.token, profile?.client_id, refetch]
  );

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    try {
      const configToSave = config || columnConfiguration;
      setColumnConfiguration(configToSave);
    } catch (error) {
      console.error("Error al actualizar configuración de columnas:", error);
      toast.error("Error al guardar la configuración de columnas");
    }
  };

  const handleOpenCollectorDetail = (collector: CollectorResponse) => {
    setSelectedCollector(collector);
    setOpenDetailModal(true);
  };

  const handleToggleStatus = async (collector: CollectorResponse) => {
    if (!session?.token || !profile?.client_id) return;

    try {
      const newStatus = !collector.status;
      await updateStatus(
        session.token,
        collector.id,
        newStatus,
        profile.client_id
      );
      toast.success(
        `Collector ${newStatus ? "activado" : "desactivado"} correctamente`
      );
      refetch();
    } catch (error) {
      console.error("Error updating collector status:", error);
      toast.error("Error al actualizar el estado del collector");
    }
  };

  const handleEditCollector = (collector: CollectorResponse) => {
    router.push(`/dashboard/collectors/edit/${collector.id}`);
  };

  const handleDeleteCollector = async (collector: CollectorResponse) => {
    if (!session?.token || !profile?.client_id) return;

    try {
      await deleteCollector(session.token, collector.id, profile.client_id);
      toast.success("Collector eliminado correctamente");
      refetch();
    } catch (error) {
      console.error("Error deleting collector:", error);
      toast.error("Error al eliminar el collector");
    }
  };

  const columns = useMemo(
    () =>
      createColumns(
        handleOpenCollectorDetail,
        handleToggleStatus,
        handleEditCollector,
        handleDeleteCollector
      ),
    []
  );

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Collectors"
          description="En esta sección podrás crear y gestionar collectors para tus deudores."
          icon={<Cog color="white" />}
          subDescription="Collectors"
        />
        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px] mb-5">
          <div className="shrink-0">
            <Image
              src="/img/collectors.svg"
              alt="Collectors"
              className="h-full object-cover rounded-md bg-slate-100 p-4 min-w-[300px]"
              width={300}
              height={300}
            />
          </div>

          <div className="w-full h-full border border-gray-200 rounded-md p-5 flex flex-col items-start justify-center gap-6">
            <span>
              Aquí podrás gestionar y organizar tus collectors de manera
              sencilla y eficiente. Crea tu primer collector para comenzar a
              automatizar tu gestión de cobranza.
            </span>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-600/80 w-xs"
              onClick={() => {
                router.push("/dashboard/collectors/create");
              }}
            >
              Crear collector
            </Button>
          </div>
        </div>

        <Card>
          <CardContent>
            <DataTableDynamicColumns
              columns={columns}
              data={data}
              isLoading={isLoading}
              isServerSideLoading={isServerSideLoading}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchChange}
              enableGlobalFilter={true}
              searchPlaceholder="Buscar collectors..."
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              initialColumnConfiguration={columnConfiguration}
              columnLabels={columnLabels}
              enableRowSelection={false}
              initialRowSelection={isHydrated ? rowSelection : {}}
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              emptyMessage="No se encontraron collectors"
              className="rounded-lg"
              title="Collectors"
              handleSuccessButton={handleUpdateColumns}
            />
            <DialogForm
              open={openDetailModal}
              onOpenChange={setOpenDetailModal}
              title="Detalle del collector"
              description={
                <div className="flex justify-between items-center bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedCollector?.name}
                  </span>
                  <div className="flex gap-2">
                    {selectedCollector?.status ? (
                      <span className="text-xs font-semibold border border-green-600 px-4 py-1 text-green-600 rounded-full bg-green-50">
                        Activo
                      </span>
                    ) : (
                      <span className="text-xs font-semibold border border-red-600 px-4 py-1 text-red-600 rounded-full bg-red-50">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              }
            >
              {selectedCollector && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Descripción
                    </p>
                    <p className="text-sm">{selectedCollector.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Canal</p>
                    <p className="text-sm">{selectedCollector.channel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Frecuencia
                    </p>
                    <p className="text-sm">{selectedCollector.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asunto</p>
                    <p className="text-sm">{selectedCollector.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mensaje</p>
                    <p className="text-sm">{selectedCollector.bodyMessage}</p>
                  </div>
                </div>
              )}
            </DialogForm>
          </CardContent>
        </Card>
      </Main>
    </>
  );
};

export default CollectorsPage;
