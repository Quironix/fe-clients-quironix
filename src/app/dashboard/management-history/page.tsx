"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import { DebtorSearchAutocomplete } from "@/app/dashboard/debtor-management/components/debtor-search-autocomplete";
import { ManagementHistoryContent } from "@/app/dashboard/debtor-management/components/management-history-content";
import { Debtor } from "@/app/dashboard/debtor-management/services/types";
import Language from "@/components/ui/language";
import { History } from "lucide-react";
import { Suspense, useState } from "react";

const Content = () => {
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);

  const handleDebtorSelect = (debtor: Debtor) => {
    setSelectedDebtorId(debtor.id);
  };

  return (
    <>
      <Header fixed>
        <DebtorSearchAutocomplete
          searchMode="simple"
          onSelect={handleDebtorSelect}
          placeholder="Buscar deudor..."
        />
        <Language />
      </Header>
      <Main>
        {selectedDebtorId ? (
          <ManagementHistoryContent
            debtorId={selectedDebtorId}
            title="Historial de Gestiones"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-gray-400">
            <History className="w-16 h-16 opacity-30" />
            <p className="text-lg font-medium">Busca un deudor para ver su historial de gestiones</p>
          </div>
        )}
      </Main>
    </>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Content />
    </Suspense>
  );
};

export default Page;
