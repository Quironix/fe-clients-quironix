"use client";

import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { getDebtorById } from "@/app/dashboard/debtors/services";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import {
  ArrowLeft,
  Building2,
  History,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getDebtorTracksByInvoices } from "../../services/tracks";
import { InvoiceWithTrack } from "../../types/debtor-tracks";
import { createInvoiceColumns } from "./components/columns-invoices";
import { TrackDetailModal } from "./components/track-detail-modal";
import { updateTableProfile } from "./services";

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

  const [invoicesWithTracks, setInvoicesWithTracks] = useState<
    InvoiceWithTrack[]
  >([]);
  const [dataDebtor, setDataDebtor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
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
    { name: "order_code", is_visible: false },
    { name: "numberOfInstallments", is_visible: true },
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

  useEffect(() => {
    if (profile?.profile?.tracks_table?.length > 0) {
      const savedConfig = profile.profile.tracks_table;
      if (Array.isArray(savedConfig)) {
        setColumnConfiguration(savedConfig);
      }
    }
  }, [profile?.profile]);

  const columnLabels = useMemo(
    () => ({
      documentNumber: "N° Documento",
      order_code: "N° Pedido",
      numberOfInstallments: "N° de cuotas",
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

  const fetchTracks = async (
    currentPage: number,
    currentLimit: number,
    search?: string
  ) => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    setLoading(true);

    try {
      const response = await getDebtorTracksByInvoices(
        session.token,
        profile.client.id,
        debtorId,
        { page: currentPage, limit: currentLimit, search }
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
    fetchTracks(page, pageSize, searchTerm);
  }, [session, debtorId, page, pageSize, searchTerm]);

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // const handleUpdateColumns = async (
  //   config?: Array<{ name: string; is_visible: boolean }>
  // ) => {
  //   if (config) {
  //     setColumnConfiguration(config);
  //   }
  // };

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    try {
      const configToSave = config || columnConfiguration;

      const response = await updateTableProfile({
        accessToken: session?.token,
        clientId: profile?.client_id,
        userId: profile?.id,
        tracksTable: configToSave,
      });

      if (response.success) {
        if (config) {
          setColumnConfiguration(config);
        }

        if (typeof window !== "undefined") {
          const storedProfile = localStorage.getItem("profile");
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile?.profile) {
              parsedProfile.profile.tracks_table = configToSave;
              localStorage.setItem("profile", JSON.stringify(parsedProfile));
            }
          }
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al actualizar configuración de columnas:", error);
      toast.error("Error al guardar la configuración de columnas");
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

  const sortedInvoicesWithTracks = useMemo(() => {
    return [...invoicesWithTracks].sort((a, b) => {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return dateA - dateB;
    });
  }, [invoicesWithTracks]);

  const TableSkeleton = () => (
    <>
      {Array.from({ length: pageSize }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="flex justify-center">
            <Skeleton className="h-5 w-5" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

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
        <div className="flex justify-between items-center mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/dashboard/debtor-management"
                    className="text-blue-600"
                  >
                    Gestión de deudores
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/dashboard/debtor-management/${dataDebtor?.id}`}
                    className="text-blue-600"
                  >
                    <span className="font-bold">
                      {`(${dataDebtor?.debtor_code}) ` || <Skeleton />}
                      {dataDebtor?.name || <Skeleton />}
                    </span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>Lista de gestiones</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/debtor-management/${dataDebtor?.id}`}>
              <div className="flex gap-1 justify-start items-center text-blue-700">
                <ArrowLeft /> Volver
              </div>
            </Link>
          </Button>
        </div>

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
              data={sortedInvoicesWithTracks}
              isLoading={loading}
              emptyMessage="No hay gestiones registradas"
              pagination={tracksPagination}
              loadingComponent={<TableSkeleton />}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchChange}
              enableGlobalFilter={true}
              searchPlaceholder="Buscar por N° Documento"
              showPagination={true}
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              columnLabels={columnLabels}
              handleSuccessButton={handleUpdateColumns}
              initialColumnConfiguration={columnConfiguration}
              title="Gestiones"
              description="Selecciona las columnas que deseas mostrar en la tabla."
              rowClassName={(invoice) =>
                invoice.type === "CREDIT_NOTE" ? "bg-red-50" : ""
              }
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
