"use client";

import { useCallback, useEffect, useState } from "react";
import { PaymentNetting, PaymentNettingFilters } from "../types";

// Mock data para demostración
const mockPaymentNettings: PaymentNetting[] = [
  {
    id: "PN-001",
    date: "2024-01-15",
    company: "Tech Solutions S.A.",
    debtor: "Juan Pérez",
    amount: 150000,
    currency: "CLP",
    status: "approved",
    reference: "REF-001-2024",
    paymentMethod: "Transferencia Bancaria",
    description: "Pago netting enero 2024",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
  },
  {
    id: "PN-002",
    date: "2024-01-16",
    company: "Innovate Corp",
    debtor: "María González",
    amount: 75000,
    currency: "CLP",
    status: "pending",
    reference: "REF-002-2024",
    paymentMethod: "Cheque",
    description: "Compensación de deudas Q1",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "PN-003",
    date: "2024-01-17",
    company: "Global Trading Ltd.",
    debtor: "Carlos Rodríguez",
    amount: 320000,
    currency: "CLP",
    status: "processing",
    reference: "REF-003-2024",
    paymentMethod: "Transferencia Bancaria",
    description: "Netting operaciones comerciales",
    createdAt: "2024-01-17T11:45:00Z",
    updatedAt: "2024-01-17T16:30:00Z",
  },
  {
    id: "PN-004",
    date: "2024-01-18",
    company: "StartUp Ventures",
    debtor: "Ana Silva",
    amount: 45000,
    currency: "CLP",
    status: "rejected",
    reference: "REF-004-2024",
    paymentMethod: "Transferencia Bancaria",
    description: "Ajuste de cuentas enero",
    createdAt: "2024-01-18T08:20:00Z",
    updatedAt: "2024-01-18T13:10:00Z",
  },
  {
    id: "PN-005",
    date: "2024-01-19",
    company: "Enterprise Solutions",
    debtor: "Roberto Morales",
    amount: 180000,
    currency: "CLP",
    status: "approved",
    reference: "REF-005-2024",
    paymentMethod: "Vale Vista",
    description: "Compensación múltiple Q1",
    createdAt: "2024-01-19T14:00:00Z",
    updatedAt: "2024-01-19T17:45:00Z",
  },
  {
    id: "PN-006",
    date: "2024-01-20",
    company: "Digital Marketing Pro",
    debtor: "Claudia Herrera",
    amount: 95000,
    currency: "CLP",
    status: "pending",
    reference: "REF-006-2024",
    paymentMethod: "Transferencia Bancaria",
    description: "Netting servicios digitales",
    createdAt: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "PN-007",
    date: "2024-01-21",
    company: "Construction Works",
    debtor: "Felipe Vargas",
    amount: 450000,
    currency: "CLP",
    status: "approved",
    reference: "REF-007-2024",
    paymentMethod: "Transferencia Bancaria",
    description: "Compensación proyecto construcción",
    createdAt: "2024-01-21T09:00:00Z",
    updatedAt: "2024-01-21T15:20:00Z",
  },
  {
    id: "PN-008",
    date: "2024-01-22",
    company: "Retail Solutions",
    debtor: "Lorena Castillo",
    amount: 67000,
    currency: "CLP",
    status: "processing",
    reference: "REF-008-2024",
    paymentMethod: "Cheque",
    description: "Netting retail enero",
    createdAt: "2024-01-22T12:15:00Z",
    updatedAt: "2024-01-22T16:00:00Z",
  },
];

export function usePaymentNetting() {
  const [data, setData] = useState<PaymentNetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerSideLoading, setIsServerSideLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFilters] = useState<PaymentNettingFilters>({});

  // Simular fetch de datos con paginación del servidor
  const fetchPaymentNettings = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: PaymentNettingFilters = {}
    ) => {
      setIsServerSideLoading(true);

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filteredData = [...mockPaymentNettings];

      // Aplicar filtros
      if (searchFilters.search) {
        const searchTerm = searchFilters.search.toLowerCase();
        filteredData = filteredData.filter(
          (item) =>
            item.company.toLowerCase().includes(searchTerm) ||
            item.debtor.toLowerCase().includes(searchTerm) ||
            item.reference.toLowerCase().includes(searchTerm) ||
            item.description?.toLowerCase().includes(searchTerm)
        );
      }

      if (searchFilters.status) {
        filteredData = filteredData.filter(
          (item) => item.status === searchFilters.status
        );
      }

      // Simular paginación del servidor
      const total = filteredData.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      const newPagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };

      setData(paginatedData);
      setPagination(newPagination);
      setIsServerSideLoading(false);
    },
    []
  );

  // Manejar cambio de paginación
  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      fetchPaymentNettings(page, pageSize, filters);
    },
    [fetchPaymentNettings, filters]
  );

  // Manejar cambio de búsqueda
  const handleSearchChange = useCallback(
    (search: string) => {
      if (search === filters.search) return; // Evitar llamadas duplicadas

      const newFilters = { ...filters, search };
      setFilters(newFilters);
      fetchPaymentNettings(1, pagination.limit, newFilters);
    },
    [fetchPaymentNettings, filters, pagination.limit]
  );

  // Memoizar refetch para evitar re-renders innecesarios
  const refetch = useCallback(() => {
    fetchPaymentNettings(pagination.page, pagination.limit, filters);
  }, [fetchPaymentNettings, pagination.page, pagination.limit, filters]);

  // Cargar datos iniciales
  useEffect(() => {
    setIsLoading(true);
    fetchPaymentNettings().finally(() => setIsLoading(false));
  }, [fetchPaymentNettings]);

  return {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    filters,
    handlePaginationChange,
    handleSearchChange,
    refetch,
  };
}
