"use client";

import { Button } from "@/components/ui/button";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import {
  ColumnDef,
  ColumnOrderState,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";
import { format, subDays } from "date-fns";
import { Eye, FileCheck2, PanelsTopLeft, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { ColumnSettingsSheet } from "../components/column-settings-sheet";
import { DataTable } from "../components/data-table";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { usePaymentNettingStore } from "./store";

// Ejemplo de datos
type PaymentData = {
  id: string;
  estado: string;
  importe: number;
  banco: string;
  numeroCuenta: string;
  codigo: string;
  fecha: string;
  descripcion: string;
  comentario: string;
};

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
  const { session, profile } = useProfileContext();
  const { fetchPaymentNetting, filters, setFilters } = usePaymentNettingStore();
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
  const columns: ColumnDef<PaymentData>[] = [
    {
      accessorKey: "estado",
      header: "Estado",
      meta: { displayName: "Estado" },
      cell: ({ row }) => {
        const status = row.getValue("estado") as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "Conciliado"
                ? "bg-green-100 text-green-800"
                : status === "Pendiente"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "importe",
      header: "Importe",
      meta: { displayName: "Importe" },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("importe"));
        const formatted = new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "banco",
      header: "Banco",
      meta: { displayName: "Banco" },
    },
    {
      accessorKey: "numeroCuenta",
      header: "Nº de cuenta",
      meta: { displayName: "Nº de cuenta" },
    },
    {
      accessorKey: "codigo",
      header: "Código",
      meta: { displayName: "Código" },
      cell: ({ row }) => {
        const code = row.getValue("codigo") as string;
        if (code === "No encontrado") {
          return (
            <div className="flex items-center">
              <span className="text-orange-600 mr-2">⚠️</span>
              <span className="text-orange-600">{code}</span>
            </div>
          );
        }
        return <span>{code}</span>;
      },
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      meta: { displayName: "Fecha" },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      meta: { displayName: "Descripción" },
    },
    {
      accessorKey: "comentario",
      header: "Comentario",
      meta: { displayName: "Comentario" },
    },
    {
      id: "action",
      header: "Acción",
      meta: { displayName: "Acción" },
      cell: () => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver</span>
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

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

  // Función para cargar configuración de columnas
  const loadColumnSettings = async () => {
    if (session?.accessToken && profile?.id) {
      setFilters({
        page: 1,
        limit: 10,
        status: "PENDING",
        createdAtToFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        createdAtTo: format(new Date(), "yyyy-MM-dd"),
      });
      // Aquí es donde harías la llamada a tu API para cargar la configuración
      console.log("Cargando configuración de columnas desde API");
      await fetchPaymentNetting(session?.accessToken, profile?.id, filters);
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
  }, []);

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
            data={sampleData}
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
