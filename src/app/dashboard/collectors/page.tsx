"use client";

import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { createColumns } from "./components/columns";
import { useCollectors } from "./hooks/useCollectors";
import { executeCollector } from "./services";
import { CollectorResponse } from "./services/types";

const CollectorsPage = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const t = useTranslations("collectors.page");
  const tCol = useTranslations("collectors.columns");
  const [executingId, setExecutingId] = useState<string | null>(null);
  const {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    handlePaginationChange,
    handleSearchChange,
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
      name: t("columnLabels.name"),
      description: t("columnLabels.description"),
      frequency: t("columnLabels.frequency"),
      subject: t("columnLabels.subject"),
      createdAt: t("columnLabels.createdAt"),
      channel: t("columnLabels.channel"),
      actions: t("columnLabels.actions"),
    }),
    [t]
  );

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    try {
      const configToSave = config || columnConfiguration;
      setColumnConfiguration(configToSave);
    } catch {
      toast.error(t("columnSaveError"));
    }
  };

  const handleExecuteCollector = async (collector: CollectorResponse) => {
    if (!session?.token || !profile?.client_id) return;
    setExecutingId(collector.id);
    try {
      await executeCollector(session.token, collector.id, profile.client_id);
      toast.success(t("executeSuccess"));
    } catch {
      toast.error(t("executeError"));
    } finally {
      setExecutingId(null);
    }
  };

  const columns = useMemo(
    () =>
      createColumns({
        onExecute: handleExecuteCollector,
        executingId,
        t: tCol,
      }),
    [tCol, executingId, session?.token, profile?.client_id]
  );

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<Cog color="white" />}
          subDescription={t("subDescription")}
        />

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
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              initialColumnConfiguration={columnConfiguration}
              columnLabels={columnLabels}
              enableRowSelection={false}
              initialRowSelection={isHydrated ? rowSelection : {}}
              onRowSelectionChange={handleRowSelectionChange}
              emptyMessage={t("emptyMessage")}
              className="rounded-lg"
              title={t("tableTitle")}
              handleSuccessButton={handleUpdateColumns}
            />
          </CardContent>
        </Card>
      </Main>
    </>
  );
};

export default CollectorsPage;
