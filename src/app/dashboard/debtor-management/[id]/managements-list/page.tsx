"use client";

import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { getDebtorById } from "@/app/dashboard/debtors/services";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Building2, History, IdCard, Mail, Phone, User } from "lucide-react";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { getDebtorTracksByInvoices } from "../../services/tracks";
import { InvoiceWithTrack } from "../../types/debtor-tracks";
import { createInvoiceColumns } from "./components/columns-invoices";
import { TrackDetailModal } from "./components/track-detail-modal";

const IconDescription = ({
  icon,
  description,
  value,
}: {
  icon: React.ReactNode;
  description: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    {icon}
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{description}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

const Content = () => {
  const params = useParams();
  const debtorId = params?.id as string;
  const { profile, session } = useProfileContext();

  const [invoicesWithTracks, setInvoicesWithTracks] = useState<InvoiceWithTrack[]>([]);
  const [dataDebtor, setDataDebtor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [tracksPagination, setTracksPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "documentNumber", is_visible: true },
    { name: "daysOverdue", is_visible: true },
    { name: "amount", is_visible: true },
    { name: "documentPhase", is_visible: true },
    { name: "timeInPhase", is_visible: true },
    { name: "createdAt", is_visible: true },
    { name: "managementType", is_visible: true },
    { name: "executive", is_visible: true },
    { name: "contact", is_visible: true },
    { name: "debtorComment", is_visible: true },
    { name: "executiveComment", is_visible: true },
    { name: "paymentCommitmentDate", is_visible: false },
    { name: "caseData", is_visible: false },
    { name: "observation", is_visible: true },
    { name: "nextManagementDate", is_visible: true },
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
      documentNumber: "N° Documento",
      daysOverdue: "Días de atraso",
      amount: "Monto",
      documentPhase: "Fase del documento",
      timeInPhase: "Tiempo en la fase",
      createdAt: "Fecha y hora de gestión",
      managementType: "Tipo de Gestión",
      executive: "Nombre analista",
      contact: "Contacto",
      debtorComment: "Comentario deudor",
      executiveComment: "Comentario Analista",
      paymentCommitmentDate: "Fecha de compromiso de pago",
      caseData: "Litigio",
      observation: "Observación",
      nextManagementDate: "Fecha de próxima gestión",
      actions: "Acciones",
    }),
    []
  );

  const fetchDebtor = async () => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    try {
      const debtor = await getDebtorById(
        session.token,
        profile.client.id,
        debtorId
      );
      setDataDebtor(debtor);
    } catch (err) {
      console.error("Error fetching debtor:", err);
    }
  };

  const fetchTracks = async (currentPage: number, currentLimit: number) => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    setLoading(true);

    try {
      const response = await getDebtorTracksByInvoices(
        session.token,
        profile.client.id,
        debtorId,
        { page: currentPage, limit: currentLimit }
      );

      setInvoicesWithTracks(response.data);
      setTracksPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
      });
    } catch (err) {
      console.error("Error fetching tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtor();
  }, [session, debtorId]);

  useEffect(() => {
    fetchTracks(page, pageSize);
  }, [session, debtorId, page, pageSize]);

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    if (config) {
      setColumnConfiguration(config);
    }
  };

  const handleViewDetails = (invoice: InvoiceWithTrack) => {
    setSelectedTrackId(invoice.track.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrackId(null);
  };

  const columns = useMemo(() => createInvoiceColumns(handleViewDetails), []);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Lista de gestiones"
          description="Visualiza y gestiona todas las interacciones registradas"
          icon={<History color="white" />}
          subDescription={`Histórico de gestiones`}
        />

        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-lg font-bold">Historial de gestiones</h2>
            <div className="bg-blue-100/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3 text-blue-800">
                Datos del deudor
              </h3>
              {dataDebtor?.id ? (
                <div className="space-y-3 grid grid-cols-3 gap-4">
                  <IconDescription
                    icon={<IdCard className="w-8 h-8 text-blue-600" />}
                    description="RUT"
                    value={dataDebtor.dni?.dni || dataDebtor.debtor_code}
                  />
                  <IconDescription
                    icon={<Building2 className="w-8 h-8 text-blue-600" />}
                    description="Razón social"
                    value={dataDebtor.name}
                  />
                  {dataDebtor.contacts && dataDebtor.contacts.length > 0 && (
                    <IconDescription
                      icon={<User className="w-8 h-8 text-blue-600" />}
                      description="Contacto"
                      value={dataDebtor.contacts[0].name}
                    />
                  )}
                  <IconDescription
                    icon={<Mail className="w-8 h-8 text-blue-600" />}
                    description="Email"
                    value={dataDebtor?.email || "Sin información"}
                  />
                  <IconDescription
                    icon={<Phone className="w-8 h-8 text-blue-600" />}
                    description="Teléfono"
                    value={dataDebtor?.phone || "Sin información"}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Cargando datos del deudor...
                </p>
              )}
            </div>
            <DataTableDynamicColumns
              columns={columns}
              data={invoicesWithTracks}
              isLoading={loading}
              emptyMessage="No hay gestiones registradas"
              pagination={tracksPagination}
              onPaginationChange={handlePaginationChange}
              showPagination={true}
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              columnLabels={columnLabels}
              handleSuccessButton={handleUpdateColumns}
              initialColumnConfiguration={columnConfiguration}
              title="Gestiones"
              description="Selecciona las columnas que deseas mostrar en la tabla."
            />
          </CardContent>
        </Card>

        <TrackDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          trackId={selectedTrackId}
          accessToken={session?.token || null}
          clientId={profile?.client?.id || null}
        />
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
