"use client";

import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import {
  getDebtorById,
  getDebtorEmailReplies,
  getDebtorOutgoingEmailReplies,
} from "@/app/dashboard/debtors/services";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExportExcelModal } from "@/components/ui/export-excel-modal";
import Language from "@/components/ui/language";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import {
  ArrowLeft,
  Building2,
  FileDown,
  History,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getDebtorTracksByInvoices,
  getTrackEmailMessages,
} from "../../services/tracks";
import { TrackEmailMessage } from "../../types/debtor-tracks";
import { InvoiceWithTrack } from "../../types/debtor-tracks";
import { createInvoiceColumns } from "./components/columns-invoices";
import { EmailThreadSheet } from "./components/email-thread-sheet";
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
  const searchParams = useSearchParams();
  const fromManagementsList =
    searchParams.get("from") === "managements-list";
  const threadIdFromUrl = searchParams.get("threadId");
  const trackIdFromUrl = searchParams.get("trackId");
  const { profile, session } = useProfileContext();

  const [invoicesWithTracks, setInvoicesWithTracks] = useState<
    InvoiceWithTrack[]
  >([]);
  const [dataDebtor, setDataDebtor] = useState<any>(null);
  const [emailReplies, setEmailReplies] = useState<any[]>([]);
  const [isFetchingEmailReplies, setIsFetchingEmailReplies] = useState(true);
  const [outgoingEmailReplies, setOutgoingEmailReplies] = useState<any[]>([]);
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
  const [exportOpen, setExportOpen] = useState(false);
  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "debtor_code", is_visible: true },
    { name: "documentNumber", is_visible: true },
    { name: "order_code", is_visible: false },
    { name: "number_of_installments", is_visible: true },
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
    { name: "collectorName", is_visible: true },
    { name: "collectorChannel", is_visible: true },
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
      const savedConfig = profile.profile.tracks_table as Array<{ name: string; is_visible: boolean }>;
      if (!Array.isArray(savedConfig)) return;

      const defaultConfig = [
        { name: "debtor_code", is_visible: true },
        { name: "documentNumber", is_visible: true },
        { name: "order_code", is_visible: false },
        { name: "number_of_installments", is_visible: true },
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
        { name: "collectorName", is_visible: true },
        { name: "collectorChannel", is_visible: true },
        { name: "actions", is_visible: true },
      ];

      const savedNames = new Set(savedConfig.map((c) => c.name));
      const newCols = defaultConfig.filter((c) => !savedNames.has(c.name));

      // Insert new cols before "actions", keep actions always last
      const withoutActions = savedConfig.filter((c) => c.name !== "actions");
      const merged = [...withoutActions, ...newCols, { name: "actions", is_visible: true }];

      setColumnConfiguration(merged);
    }
  }, [profile?.profile]);

  const columnLabels = useMemo(
    () => ({
      debtor_code: "Código Deudor",
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
      collectorName: "Collector",
      collectorChannel: "Canal",
      actions: "Acciones",
    }),
    [],
  );

  const fetchDebtor = async () => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    try {
      const debtor = await getDebtorById(
        session.token,
        profile.client.id,
        debtorId,
      );
      setDataDebtor(debtor);
    } catch (err) {
      console.error("Error fetching debtor:", err);
    }
  };

  const fetchEmailReplies = async () => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    setIsFetchingEmailReplies(true);
    try {
      const replies = await getDebtorEmailReplies(
        session.token,
        profile.client.id,
        debtorId,
      );
      setEmailReplies(Array.isArray(replies) ? replies : []);
    } catch (err) {
      console.error("Error fetching debtor email replies:", err);
      setEmailReplies([]);
    } finally {
      setIsFetchingEmailReplies(false);
    }
  };

  const fetchOutgoingEmailReplies = async () => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    try {
      const replies = await getDebtorOutgoingEmailReplies(
        session.token,
        profile.client.id,
        debtorId,
      );
      setOutgoingEmailReplies(Array.isArray(replies) ? replies : []);
    } catch (err) {
      console.error("Error fetching debtor outgoing email replies:", err);
      setOutgoingEmailReplies([]);
    }
  };

  // Función helper para enriquecer el contacto con el nombre del deudor
  const enrichContactWithName = (
    invoices: InvoiceWithTrack[],
    debtorContacts: any[],
  ): InvoiceWithTrack[] => {
    if (!debtorContacts || debtorContacts.length === 0) return invoices;

    return invoices.map((invoice) => {
      if (!invoice.track?.contact) return invoice;

      // Buscar el nombre del contacto comparando el email/teléfono
      const matchingContact = debtorContacts.find(
        (contact: any) =>
          contact.email === invoice.track.contact.value ||
          contact.phone === invoice.track.contact.value,
      );

      // Si encontramos el contacto, agregamos el nombre
      if (matchingContact) {
        return {
          ...invoice,
          track: {
            ...invoice.track,
            contact: {
              ...invoice.track.contact,
              name: matchingContact.name,
            },
          },
        };
      }

      return invoice;
    });
  };

  const fetchTracks = async (
    currentPage: number,
    currentLimit: number,
    search?: string,
  ) => {
    if (!session?.token || !profile?.client?.id || !debtorId) return;

    setLoading(true);

    try {
      const response = await getDebtorTracksByInvoices(
        session.token,
        profile.client.id,
        debtorId,
        { page: currentPage, limit: currentLimit, search },
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
    fetchEmailReplies();
    fetchOutgoingEmailReplies();
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
    config?: Array<{ name: string; is_visible: boolean }>,
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

  // Facturas agrupadas por track.id, para que el correo entrante muestre el
  // monto total del envío (puede cubrir varias facturas) y la lista de
  // documentos involucrados, en vez de un monto/número elegido
  // arbitrariamente entre las facturas del track.
  const trackInvoicesByTrackId = useMemo(() => {
    const map = new Map<
      string,
      { number: string; balance: string }[]
    >();
    invoicesWithTracks.forEach((invoice) => {
      const trackId = invoice.track?.id;
      if (!trackId) return;
      const existing = map.get(trackId) || [];
      existing.push({
        number: invoice.number || invoice.external_number || "",
        balance: invoice.balance || "",
      });
      map.set(trackId, existing);
    });
    return map;
  }, [invoicesWithTracks]);

  // Convierte cada correo entrante en una fila más de la tabla de gestiones,
  // con managementType "MAIL_IN" (ya mapeado a la etiqueta "Correo entrante"
  // en config/management-types.ts). Es puramente una vista unificada en el
  // frontend — no crea una gestión real en el backend.
  const emailReplyRows = useMemo<InvoiceWithTrack[]>(
    () =>
      emailReplies.map((reply) => {
        const trackInvoices = reply.track_id
          ? trackInvoicesByTrackId.get(reply.track_id)
          : undefined;
        const totalAmount = trackInvoices
          ? trackInvoices.reduce(
              (sum, inv) => sum + (parseFloat(inv.balance || "0") || 0),
              0,
            )
          : undefined;
        const isMultiInvoice = (trackInvoices?.length ?? 0) > 1;
        const attachments: { filename: string; storage_url: string }[] =
          Array.isArray(reply.attachments)
            ? reply.attachments.map(
                (a: { filename: string; storage_url: string }) => ({
                  filename: a.filename,
                  storage_url: a.storage_url,
                }),
              )
            : [];

        return {
        id: reply.id,
        type: "EMAIL_REPLY",
        number: isMultiInvoice ? "" : reply.invoice?.number || "",
        external_number: reply.invoice?.external_number || "",
        batchInvoiceNumbers: isMultiInvoice
          ? trackInvoices!.map((inv) => inv.number).filter(Boolean)
          : undefined,
        is_internal_document: false,
        amount: "",
        order_number: null,
        issue_date: "",
        is_fictitious: false,
        company_id: null,
        reference: null,
        file: "",
        due_date: reply.invoice?.due_date || "",
        operation_date: null,
        reception_date: null,
        folio: "",
        balance:
          totalAmount !== undefined
            ? String(totalAmount)
            : reply.invoice?.balance || "",
        litigation_balance: "",
        number_of_installments: reply.invoice?.number_of_installments || 0,
        observations: "",
        order_code: reply.invoice?.order_code || "",
        ref_1: null,
        ref_2: null,
        ref_3: null,
        ref_4: null,
        client_id: dataDebtor?.client_id || "",
        debtor_id: debtorId,
        debtor_code: dataDebtor?.debtor_code || "",
        status: "",
        created_at: reply.created_at,
        updated_at: reply.created_at,
        payment_plan_id: null,
        phases: [],
        track: {
          id: reply.track_id || null,
          clientId: dataDebtor?.client_id || "",
          debtorId: debtorId,
          managementType: "MAIL_IN",
          executiveId: "",
          executive: null,
          contact: { type: "EMAIL", value: reply.from_address },
          debtorComment: "",
          executiveComment: "",
          observation: "",
          nextManagementDate: "",
          caseData: {},
          metadata: {},
          invoiceIds: [],
          invoices: [],
          createdAt: reply.created_at,
          updatedAt: reply.created_at,
          attachments,
          emailSubject: reply.subject || "",
          emailBody: reply.body_text || "",
        },
        };
      }) as unknown as InvoiceWithTrack[],
    [emailReplies, dataDebtor?.client_id, debtorId, trackInvoicesByTrackId],
  );

  // Igual que emailReplyRows, pero para correos salientes que son
  // *respuestas* dentro de un hilo (enviadas desde el panel de hilo) — el
  // primer envío de cada gestión ya se ve como la fila real del Track, así
  // que el backend excluye ese primero y solo devuelve los siguientes.
  // managementType "MAIL_OUT_REPLY" (distinto de "MAIL_OUT" real) para no
  // pisar el render de comentarios de gestiones salientes reales.
  const emailOutRows = useMemo<InvoiceWithTrack[]>(
    () =>
      outgoingEmailReplies.map((reply) => {
        const trackInvoices = reply.track_id
          ? trackInvoicesByTrackId.get(reply.track_id)
          : undefined;
        const totalAmount = trackInvoices
          ? trackInvoices.reduce(
              (sum, inv) => sum + (parseFloat(inv.balance || "0") || 0),
              0,
            )
          : undefined;
        const isMultiInvoice = (trackInvoices?.length ?? 0) > 1;
        const attachments: { filename: string; storage_url: string }[] =
          Array.isArray(reply.attachments)
            ? reply.attachments.map(
                (a: { filename: string; storage_url: string }) => ({
                  filename: a.filename,
                  storage_url: a.storage_url,
                }),
              )
            : [];
        const plainBody = (reply.body_html || "")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "");

        return {
          id: reply.id,
          type: "EMAIL_REPLY_OUT",
          number: isMultiInvoice ? "" : reply.invoice?.number || "",
          external_number: reply.invoice?.external_number || "",
          batchInvoiceNumbers: isMultiInvoice
            ? trackInvoices!.map((inv) => inv.number).filter(Boolean)
            : undefined,
          is_internal_document: false,
          amount: "",
          order_number: null,
          issue_date: "",
          is_fictitious: false,
          company_id: null,
          reference: null,
          file: "",
          due_date: reply.invoice?.due_date || "",
          operation_date: null,
          reception_date: null,
          folio: "",
          balance:
            totalAmount !== undefined
              ? String(totalAmount)
              : reply.invoice?.balance || "",
          litigation_balance: "",
          number_of_installments: reply.invoice?.number_of_installments || 0,
          observations: "",
          order_code: reply.invoice?.order_code || "",
          ref_1: null,
          ref_2: null,
          ref_3: null,
          ref_4: null,
          client_id: dataDebtor?.client_id || "",
          debtor_id: debtorId,
          debtor_code: dataDebtor?.debtor_code || "",
          status: "",
          created_at: reply.created_at,
          updated_at: reply.created_at,
          payment_plan_id: null,
          phases: [],
          track: {
            id: reply.track_id || null,
            clientId: dataDebtor?.client_id || "",
            debtorId: debtorId,
            managementType: "MAIL_OUT_REPLY",
            executiveId: "",
            executive: null,
            contact: { type: "EMAIL", value: reply.to_addresses?.[0] || "" },
            debtorComment: "",
            executiveComment: "",
            observation: "",
            nextManagementDate: "",
            caseData: {},
            metadata: {},
            invoiceIds: [],
            invoices: [],
            createdAt: reply.created_at,
            updatedAt: reply.created_at,
            attachments,
            emailSubject: reply.subject || "",
            emailBody: plainBody,
          },
        };
      }) as unknown as InvoiceWithTrack[],
    [
      outgoingEmailReplies,
      dataDebtor?.client_id,
      debtorId,
      trackInvoicesByTrackId,
    ],
  );

  // Enriquecer y ordenar los datos de forma reactiva
  const enrichedAndSortedInvoices = useMemo(() => {
    // Primero enriquecemos con el nombre del contacto
    const enriched = enrichContactWithName(
      invoicesWithTracks,
      dataDebtor?.contacts || [],
    );

    // Mezclar gestiones reales con los correos entrantes/salientes-respuesta
    // y ordenar por fecha
    return [...enriched, ...emailReplyRows, ...emailOutRows].sort((a, b) => {
      const dateA = new Date(a.track?.createdAt ?? 0).getTime();
      const dateB = new Date(b.track?.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }, [invoicesWithTracks, dataDebtor?.contacts, emailReplyRows, emailOutRows]);

  const THREAD_COLOR_PALETTE = [
    "amber",
    "purple",
    "pink",
    "cyan",
    "indigo",
    "rose",
  ] as const;

  // Agrupa correos salientes/entrantes que comparten el mismo track.id
  // (el correo entrante siempre queda vinculado al track que lo originó,
  // ver PRD respuesta_correos_deudores). Solo se considera "hilo" un grupo
  // que efectivamente tenga al menos una respuesta (MAIL_IN); un correo
  // saliente sin respuesta no se marca. Es una vista puramente visual, no
  // reordena ni colapsa filas de la tabla cronológica.
  const { threadGroups, threadColorByTrackId } = useMemo(() => {
    const rowsByTrackId = new Map<string, InvoiceWithTrack[]>();

    enrichedAndSortedInvoices.forEach((invoice) => {
      const managementType = invoice.track?.managementType;
      const trackId = invoice.track?.id;
      if (
        !trackId ||
        (managementType !== "MAIL_OUT" &&
          managementType !== "MAIL_OUT_REPLY" &&
          managementType !== "MAIL_IN" &&
          managementType !== "AUTOMATED_COLLECTOR")
      ) {
        return;
      }
      const existing = rowsByTrackId.get(trackId) || [];
      if (!existing.find((r) => r.id === invoice.id)) {
        existing.push(invoice);
      }
      rowsByTrackId.set(trackId, existing);
    });

    const groups = new Map<string, InvoiceWithTrack[]>();
    rowsByTrackId.forEach((rows, trackId) => {
      const hasReply = rows.some(
        (r) => r.track?.managementType === "MAIL_IN",
      );
      if (hasReply && rows.length > 1) {
        const sorted = [...rows].sort(
          (a, b) =>
            new Date(a.track?.createdAt ?? 0).getTime() -
            new Date(b.track?.createdAt ?? 0).getTime(),
        );
        // Un envío del collector puede generar varias filas (una por
        // factura) para el mismo track. En el hilo solo debe verse un
        // correo saliente por track (ahí se mostrará el correo real
        // enviado), no una fila repetida por cada factura.
        // Las filas salientes que se agrupan bajo la representante quedan
        // en batchInvoices, para poder mostrar el N° de facturas y el
        // monto total en vez de repetir una fila por factura.
        let representative: InvoiceWithTrack | null = null;
        const dedupedRows: InvoiceWithTrack[] = [];
        sorted.forEach((r) => {
          const isOutbound =
            r.track?.managementType === "MAIL_OUT" ||
            r.track?.managementType === "AUTOMATED_COLLECTOR";
          if (!isOutbound) {
            dedupedRows.push(r);
            return;
          }
          if (!representative) {
            representative = { ...r, batchInvoices: [r] };
            dedupedRows.push(representative);
          } else {
            representative.batchInvoices!.push(r);
          }
        });
        groups.set(trackId, dedupedRows);
      }
    });

    const colorByTrackId = new Map<string, (typeof THREAD_COLOR_PALETTE)[number]>();
    Array.from(groups.keys()).forEach((trackId, index) => {
      colorByTrackId.set(
        trackId,
        THREAD_COLOR_PALETTE[index % THREAD_COLOR_PALETTE.length],
      );
    });

    return { threadGroups: groups, threadColorByTrackId: colorByTrackId };
  }, [enrichedAndSortedInvoices]);

  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(
    null,
  );
  const [threadEmailMessages, setThreadEmailMessages] = useState<
    TrackEmailMessage[]
  >([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const refreshThreadMessages = async (trackId: string) => {
    if (!session?.token || !profile?.client?.id) return;
    setThreadLoading(true);
    try {
      const messages = await getTrackEmailMessages(
        session.token,
        profile.client.id,
        trackId,
      );
      setThreadEmailMessages(messages);
    } catch (error) {
      console.error("Error al obtener el hilo de correo:", error);
      toast.error("No se pudo cargar el hilo de correo");
    } finally {
      setThreadLoading(false);
    }
  };

  const handleOpenThread = (trackId: string) => {
    setSelectedThreadKey(trackId);
    refreshThreadMessages(trackId);
  };

  const handleCloseThread = () => {
    setSelectedThreadKey(null);
    setThreadEmailMessages([]);
  };

  useEffect(() => {
    if (threadIdFromUrl) {
      handleOpenThread(threadIdFromUrl);
    } else if (trackIdFromUrl) {
      setSelectedTrackId(trackIdFromUrl);
      setIsModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadIdFromUrl, trackIdFromUrl]);

  const columns = useMemo(
    () =>
      createInvoiceColumns(
        handleViewDetails,
        threadColorByTrackId,
        handleOpenThread,
      ),
    [threadColorByTrackId],
  );


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
          subDescription={`Historial de gestiones`}
        />
        <div className="flex justify-between items-center mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              {fromManagementsList ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href="/dashboard/debtor-management/managements-list"
                        className="text-blue-600"
                      >
                        Lista de gestiones
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="font-bold">
                      {`(${dataDebtor?.debtor_code}) ` || <Skeleton />}
                      {dataDebtor?.name || <Skeleton />}
                    </span>
                  </BreadcrumbItem>
                </>
              ) : (
                <>
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
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost" asChild>
            <Link
              href={
                fromManagementsList
                  ? "/dashboard/debtor-management/managements-list"
                  : `/dashboard/debtor-management/${dataDebtor?.id}`
              }
            >
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
              data={enrichedAndSortedInvoices}
              isLoading={loading || isFetchingEmailReplies}
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
              ctaNode={
                <Button variant="outline" onClick={() => setExportOpen(true)}>
                  <FileDown className="h-4 w-4 mr-2 text-orange-400" />
                  Exportar
                </Button>
              }
            />
            <ExportExcelModal
              open={exportOpen}
              onOpenChange={setExportOpen}
              schema="MANAGEMENTS"
              accessToken={session?.token || ""}
              clientId={profile?.client?.id || ""}
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

        <EmailThreadSheet
          isOpen={!!selectedThreadKey}
          onClose={handleCloseThread}
          messages={threadEmailMessages}
          loading={threadLoading}
          trackId={selectedThreadKey}
          accessToken={session?.token || ""}
          clientId={profile?.client?.id || ""}
          debtorName={dataDebtor?.contacts?.[0]?.name || dataDebtor?.name}
          executiveProfile={profile}
          onMessageSent={() => {
            if (selectedThreadKey) refreshThreadMessages(selectedThreadKey);
            fetchOutgoingEmailReplies();
          }}
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
