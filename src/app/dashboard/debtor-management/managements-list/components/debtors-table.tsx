"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getDebtors } from "@/app/dashboard/debtors/services";
import { useCompaniesStore } from "@/app/dashboard/companies/store";

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
  const { companies, getCompanies } = useCompaniesStore();

  const [data, setData] = useState<DebtorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (isFactoring && session?.token && profile?.client?.id && companies.length === 0) {
      getCompanies(session.token, profile.client.id);
    }
  }, [isFactoring, session?.token, profile?.client?.id, companies.length, getCompanies]);

  const companyIds = isFactoring ? companies.map((c) => c.id).filter(Boolean) as string[] : [];

  const fetchDebtors = useCallback(
    async (page: number = 1, limit: number = 15, searchTerm: string = "") => {
      if (!session?.token || !profile?.client_id) return;
      if (isFactoring && companyIds.length === 0) return;
      setIsServerSideLoading(true);
      try {
        const response = await getDebtors(
          session.token,
          profile.client_id,
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
      } catch {
        setData([]);
      } finally {
        setIsServerSideLoading(false);
      }
    },
    [session?.token, profile?.client_id, isFactoring, companyIds]
  );

  useEffect(() => {
    if (!session?.token || !profile?.client_id) return;
    if (isFactoring && companyIds.length === 0) return;
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      setIsLoading(true);
      fetchDebtors(1, 15, "").finally(() => setIsLoading(false));
    }
  }, [session?.token, profile?.client_id, isFactoring, companyIds, fetchDebtors]);

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
