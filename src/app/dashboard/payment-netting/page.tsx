"use client";

import { Button } from "@/components/ui/button";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import {
  ColumnOrderState,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";
import { format, subDays, subDays as subDaysHelper } from "date-fns";
import { FileCheck2, PanelsTopLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ColumnSettingsSheet } from "../components/column-settings-sheet";
import { DataTable } from "../components/data-table";
import { createPaymentNettingFilterConfig } from "../components/filter-configs/payment-netting-filters";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { columns } from "./components/columns";
import { Datum, usePaymentNettingStore } from "./store";
import { PaymentData } from "./types";

const sampleData: PaymentData[] = [
  {
    id: "1",
    estado: "Conciliado",
    importe: 42437696,
    banco: "Santander",
    numeroCuenta: "1234567899",
    codigo: "123456778",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "---",
  },
  {
    id: "2",
    estado: "Pendiente",
    importe: -2290510,
    banco: "Banco de Chile",
    numeroCuenta: "1234567899",
    codigo: "No encontrado",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "Lorem ipsum is dolor sit amet...",
  },
  {
    id: "3",
    estado: "Eliminado",
    importe: 600464,
    banco: "Scotiabank",
    numeroCuenta: "1234567899",
    codigo: "No encontrado",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "---",
  },
  {
    id: "4",
    estado: "Conciliado",
    importe: 4437696,
    banco: "Santander",
    numeroCuenta: "1234567899",
    codigo: "123456778",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "Lorem ipsum is dolor sit amet...",
  },
  {
    id: "5",
    estado: "Conciliado",
    importe: 8240638,
    banco: "Santander",
    numeroCuenta: "1234567899",
    codigo: "No encontrado",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "---",
  },
  {
    id: "6",
    estado: "Eliminado",
    importe: 8240638,
    banco: "Banco de Chile",
    numeroCuenta: "1234567899",
    codigo: "123456778",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "---",
  },
  {
    id: "7",
    estado: "Pendiente",
    importe: -2290510,
    banco: "Banco de Chile",
    numeroCuenta: "1234567899",
    codigo: "123456778",
    fecha: "12/04/2025",
    descripcion: "Lorem ipsum is dolor sit amet...",
    comentario: "Lorem ipsum is dolor sit amet...",
  },
];

const Page = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const { fetchPaymentNetting, filters, setFilters, paymentNettings } =
    usePaymentNettingStore();
  // Estado para la visibilidad de columnas
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    estado: true,
    importe: true,
    banco: true,
    numeroCuenta: true,
    codigo: true,
    fecha: true,
    descripcion: true,
    comentario: true,
    action: true,
  });

  // Estado para el orden de columnas
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  // Estado para la selección de filas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Definir columnas en el orden solicitado

  // Orden predeterminado de columnas según especificación
  const defaultColumnOrder = [
    "select", // Columna de selección siempre primera
    "estado",
    "importe",
    "banco",
    "numeroCuenta",
    "codigo",
    "fecha",
    "descripcion",
    "comentario",
    "action",
  ];

  // Función para guardar configuración de columnas
  const saveColumnSettings = async (
    visibility: VisibilityState,
    order: ColumnOrderState
  ) => {
    // Aquí es donde harías la llamada a tu API para guardar la configuración
    console.log("Guardando configuración de columnas:", { visibility, order });
    // Ejemplo: await api.saveColumnSettings('payment-netting', { visibility, order });
  };

  // Función para manejar cambios en la selección de filas
  const handleSelectedRowsChange = (selectedRows: PaymentData[]) => {
    console.log("Filas seleccionadas:", selectedRows);
    // Aquí puedes hacer lo que necesites con las filas seleccionadas
  };

  // Función para transformar los datos de la API al formato de la UI
  const transformApiDataToUI = (apiData: Datum[]): PaymentData[] => {
    return apiData.map((item) => ({
      id: item.id,
      estado: item.status,
      importe: parseFloat(item.amount),
      banco: item.bank_information?.bank || "N/A",
      numeroCuenta: item.bank_information?.account_number || "N/A",
      codigo: item.movement_number || "No encontrado",
      fecha: item.movement_date,
      descripcion: item.description,
      comentario: item.comment || "---",
    }));
  };

  // Función para manejar cambios en filtros
  const handleFiltersChange = async (newFilters: Record<string, any>) => {
    if (session?.token && profile?.client?.id) {
      const filterPayload = {
        page: newFilters.page || 1,
        limit: parseInt(newFilters.limit) || 10,
        status: newFilters.status || "ALL",
        createdAtToFrom: newFilters.dateFrom
          ? format(newFilters.dateFrom, "yyyy-MM-dd")
          : format(subDaysHelper(new Date(), 30), "yyyy-MM-dd"),
        createdAtTo: newFilters.dateTo
          ? format(newFilters.dateTo, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      };

      setFilters(filterPayload);
      await fetchPaymentNetting(
        session.token,
        profile.client.id,
        filterPayload
      );
    }
  };

  // Función para resetear filtros
  const handleFiltersReset = async () => {
    if (session?.token && profile?.client?.id) {
      const defaultFilters = {
        page: 1,
        limit: 10,
        status: "ALL",
        createdAtToFrom: format(subDaysHelper(new Date(), 30), "yyyy-MM-dd"),
        createdAtTo: format(new Date(), "yyyy-MM-dd"),
      };

      setFilters(defaultFilters);
      await fetchPaymentNetting(
        session.token,
        profile.client.id,
        defaultFilters
      );
    }
  };

  // Función para cargar configuración de columnas
  const loadColumnSettings = async () => {
    if (session?.token && profile?.client?.id) {
      const newFilters = {
        page: 1,
        limit: 10,
        status: "ALL",
        createdAtToFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        createdAtTo: format(new Date(), "yyyy-MM-dd"),
      };
      setFilters(newFilters);
      // Aquí es donde harías la llamada a tu API para cargar la configuración
      console.log("Cargando configuración de columnas desde API");

      await fetchPaymentNetting(
        session?.token,
        profile?.client?.id,
        newFilters
      );
    }
    // Ejemplo: const saved = await api.getColumnSettings('payment-netting');
    // if (saved) {
    //   setColumnVisibility(saved.visibility || defaultVisibility);
    //   setColumnOrder(saved.order || defaultColumnOrder);
    // }

    // Establecer orden predeterminado si no hay configuración guardada
    if (columnOrder.length === 0) {
      setColumnOrder(defaultColumnOrder);
    }
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadColumnSettings();
  }, [session?.token, profile?.id]);

  // Manejar cambios en la visibilidad de columnas
  const handleColumnVisibilityChange = (
    visibility: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => {
    const newVisibility =
      typeof visibility === "function"
        ? visibility(columnVisibility)
        : visibility;
    setColumnVisibility(newVisibility);
    saveColumnSettings(newVisibility, columnOrder);
  };

  // Manejar cambios en el orden de columnas
  const handleColumnOrderChange = (
    updaterOrValue:
      | ColumnOrderState
      | ((old: ColumnOrderState) => ColumnOrderState)
  ) => {
    const newOrder =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnOrder)
        : updaterOrValue;
    setColumnOrder(newOrder);
    saveColumnSettings(columnVisibility, newOrder);
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Compensación de pagos"
          description="En esta sección podrás realizar la compensación de pagos entre tus clientes y proveedores."
          icon={<FileCheck2 color="white" />}
          subDescription="Compensación de pagos"
        />

        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <DataTable
            title="Historial de pagos"
            toolbarLayout="split"
            enableGlobalFilter={true}
            enableRowSelection={true}
            hideDefaultControls={true}
            columns={columns}
            data={transformApiDataToUI(paymentNettings || [])}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            columnOrder={columnOrder}
            onColumnOrderChange={handleColumnOrderChange}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onSelectedRowsChange={handleSelectedRowsChange}
            searchPlaceholder="Buscar"
            emptyMessage="No hay pagos registrados"
            toolbar={
              <div className="flex items-center gap-3">
                <ColumnSettingsSheet
                  columns={columns}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                  columnOrder={columnOrder}
                  onColumnOrderChange={handleColumnOrderChange}
                  filterConfig={createPaymentNettingFilterConfig(
                    handleFiltersChange,
                    handleFiltersReset
                  )}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-400 text-white hover:text-white"
                    >
                      <PanelsTopLeft className="h-4 w-4 mr-2" />
                      Editar tabla
                    </Button>
                  }
                />
                <Button className="bg-orange-500 hover:bg-orange-600" size="sm">
                  Generar Pago
                </Button>
              </div>
            }
          />
        </div>
      </Main>
    </>
  );
};

export default Page;
