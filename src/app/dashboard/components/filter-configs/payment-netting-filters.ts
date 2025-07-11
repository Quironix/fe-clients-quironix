import { FilterConfig } from "../types/sheet-types";

export function createPaymentNettingFilterConfig(
  onApply: (values: Record<string, any>) => void,
  onReset: () => void
): FilterConfig {
  return {
    fields: [
      {
        id: "status",
        label: "Estado",
        type: "select",
        placeholder: "Seleccionar estado",
        options: [
          { value: "ALL", label: "Todos" },
          { value: "PENDING", label: "Pendiente" },
          { value: "COMPLETED", label: "Conciliado" },
          { value: "DELETED", label: "Eliminado" },
        ],
        defaultValue: "ALL",
      },
      {
        id: "dateFrom",
        label: "Fecha desde",
        type: "date",
        placeholder: "Seleccionar fecha",
      },
      {
        id: "dateTo",
        label: "Fecha hasta",
        type: "date",
        placeholder: "Seleccionar fecha",
      },
      {
        id: "limit",
        label: "Resultados por página",
        type: "select",
        options: [
          { value: "10", label: "10" },
          { value: "25", label: "25" },
          { value: "50", label: "50" },
          { value: "100", label: "100" },
        ],
        defaultValue: "10",
      },
    ],
    defaultValues: {
      status: "ALL",
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
      limit: 10,
    },
    onApply,
    onReset,
  };
}