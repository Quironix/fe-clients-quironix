"use client";

import { useCompaniesStore } from "@/app/dashboard/companies/store";
import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import { getDebtors, HttpError } from "@/app/dashboard/debtors/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DebtorRow {
  id: string;
  name: string;
  debtor_code: string;
  dni?: {
    dni: string;
    type: string;
  };
}

interface DebtorsTableProps {
  isFactoring: boolean;
}

const DebtorsTable = ({ isFactoring }: DebtorsTableProps) => {
  const t = useTranslations("debtorManagement.managementsList");
  const router = useRouter();
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { companies, getCompanies, loading: companiesLoading, hasFetched: companiesHasFetched, permissionDenied } = useCompaniesStore();

  const [data, setData] = useState<DebtorRow[]>([]);
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
  const [search, setSearch] = useState("");
  const hasInitialized = useRef(false);

  // Cargar companies si es factoring y aún no se han cargado
  useEffect(() => {
    if (isFactoring && session?.token && profile?.client?.id && !companiesHasFetched && !companiesLoading) {
      getCompanies(session.token, profile.client.id);
    }
  }, [isFactoring, session?.token, profile?.client?.id, companiesHasFetched, companiesLoading, getCompanies]);

  // Redirigir si no hay permisos para acceder a companies
  useEffect(() => {
    if (permissionDenied) {
      router.push("/dashboard/access-denied?route=/dashboard/debtor-management/managements-list");
    }
  }, [permissionDenied, router]);

  const companyIds = useMemo(() => {
    if (!isFactoring || !Array.isArray(companies)) return [];
    return companies.map((c) => c.id).filter(Boolean) as string[];
  }, [isFactoring, companies]);

  // Determinar si todas las dependencias están listas para el fetch inicial
  const isReady = useMemo(() => {
    if (!session?.token || !profile?.client?.id) return false;
    if (isFactoring) return companiesHasFetched && !companiesLoading;
    return true;
  }, [session?.token, profile?.client?.id, isFactoring, companiesHasFetched, companiesLoading]);

  const fetchDebtors = useCallback(
    async (page: number = 1, limit: number = 15, searchTerm: string = "") => {
      if (!session?.token || !profile?.client?.id) return;
      if (isFactoring && companyIds.length === 0) return;
      setIsServerSideLoading(true);
      try {
        const response = await getDebtors(
          session.token,
          profile.client.id,
          {
            page,
            limit,
            search: searchTerm || undefined,
            ...(isFactoring && companyIds.length > 0 ? { company_ids: companyIds } : {}),
          }
        );
        setData((response.data as DebtorRow[]) ?? []);
        const total = response.pagination?.total ?? 0;
        const totalPages = response.pagination?.totalPages ?? 1;
        setPagination({
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        });
      } catch (error) {
        if (error instanceof HttpError && error.status === 403) {
          router.push("/dashboard/access-denied?route=/dashboard/debtor-management/managements-list");
          return;
        }
        setData([]);
      } finally {
        setIsServerSideLoading(false);
      }
    },
    [session?.token, profile?.client?.id, isFactoring, companyIds]
  );

  // Fetch inicial: solo se ejecuta una vez cuando todas las dependencias están listas
  useEffect(() => {
    if (!isReady || hasInitialized.current) return;
    hasInitialized.current = true;
    setIsLoading(true);
    fetchDebtors(1, 15, "").finally(() => setIsLoading(false));
  }, [isReady, fetchDebtors]);

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      fetchDebtors(page, pageSize, search);
    },
    [fetchDebtors, search]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      if (value === search) return;
      setSearch(value);
      fetchDebtors(1, pagination.limit, value);
    },
    [fetchDebtors, search, pagination.limit]
  );

  const columns = useMemo(
    (): ColumnDef<DebtorRow>[] => [
      {
        accessorKey: "name",
        header: t("columnName"),
        cell: ({ row }) => (
          <div className="font-medium text-sm text-left">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "debtor_code",
        header: t("columnCode"),
        cell: ({ row }) => (
          <div className="text-sm text-gray-700">{row.original.debtor_code}</div>
        ),
      },
      {
        accessorKey: "dni",
        header: t("columnRut"),
        cell: ({ row }) => (
          <div className="text-sm text-gray-700">{row.original.dni?.dni ?? "-"}</div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() =>
              router.push(
                `/dashboard/debtor-management/${row.original.id}/managements-list?from=managements-list`
              )
            }
          >
            {t("viewHistory")}
          </Button>
        ),
      },
    ],
    [t, router]
  );

  return (
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
          searchPlaceholder={t("searchPlaceholder")}
          enableColumnFilter={false}
          enableRowSelection={false}
          emptyMessage={t("emptyState")}
          className="rounded-lg"
          title={t("pageTitle")}
        />
      </CardContent>
    </Card>
  );
};

export default DebtorsTable;
