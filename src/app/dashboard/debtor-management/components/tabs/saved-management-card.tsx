"use client";

import { SavedManagement } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface SavedManagementCardProps {
  management: SavedManagement;
  index: number;
  onDelete: (id: string) => void;
}

// Labels para los valores
const managementTypeLabels: Record<string, string> = {
  outgoing_call: "Llamada saliente",
  incoming_call: "Llamada entrante",
  email: "Correo electrónico",
  visit: "Visita",
  letter: "Carta",
  whatsapp: "WhatsApp",
};

const debtorCommentsLabels: Record<string, string> = {
  hara_pago: "Hará pago",
  acepta_pago: "Acepta pago",
  rechaza_pago: "Rechaza pago",
  solicita_plazo: "Solicita plazo",
  no_contesta: "No contesta",
  otro: "Otro",
};

const analystCommentsLabels: Record<string, string> = {
  con_compromiso_pago: "Con compromiso de pago",
  deudor_contactado: "Deudor contactado",
  sin_respuesta: "Sin respuesta",
  requiere_seguimiento: "Requiere seguimiento",
  otro: "Otro",
};

export const SavedManagementCard = ({
  management,
  index,
  onDelete,
}: SavedManagementCardProps) => {
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="border border-gray-200 rounded-md"
    >
      <AccordionItem value="item-1" className="border-0">
        <div className="flex items-center justify-between pr-4 min-h-[60px]">
          <AccordionTrigger className="flex-1 hover:no-underline px-4">
            <h3 className="text-base font-semibold text-blue-600">
              Gestión {index + 1}
            </h3>
          </AccordionTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(management.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
          </Button>
        </div>

        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Tabla de Documentos */}
            {management.selectedInvoices.length > 0 && (
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50 z-10">
                        <TableRow>
                          <TableHead className="text-xs font-medium">
                            Nº Documento
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Tipo
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Emisión
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Vencimiento
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Monto
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Saldo
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Atraso
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Fase
                          </TableHead>
                          <TableHead className="text-xs font-medium">
                            Documentos
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {management.selectedInvoices.map((invoice, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-medium">
                              {invoice.number || invoice.folio || "-"}
                            </TableCell>
                            <TableCell className="text-xs">
                              <DocumentTypeBadge type={invoice.type} />
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatDate(invoice.issue_date)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatDate(invoice.due_date)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell className="text-xs text-red-600 font-medium">
                              {formatCurrency(invoice.balance)}
                            </TableCell>
                            <TableCell className="text-xs">4</TableCell>
                            <TableCell className="text-xs">
                              {invoice.phases && invoice.phases.length > 0
                                ? (
                                    invoice.phases[
                                      invoice.phases.length - 1
                                    ] as any
                                  )?.phase || "-"
                                : "-"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {invoice.file ? (
                                <a
                                  href={invoice.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                  </svg>
                                </a>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                </svg>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de Gestión */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="font-semibold text-sm text-gray-700">Gestión</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-400 rounded-sm"></div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">
                      Tipo de gestión
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {managementTypeLabels[
                        management.formData.managementType
                      ] || "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">
                        Comentario del deudor
                      </span>
                      <p className="text-sm text-gray-900">
                        {debtorCommentsLabels[
                          management.formData.debtorComments
                        ] || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">
                        Comentario del analista
                      </span>
                      <p className="text-sm text-gray-900">
                        {analystCommentsLabels[
                          management.formData.analystComments
                        ] || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compromiso de pago (Condicional) */}
            {(management.formData.analystComments === "con_compromiso_pago" ||
              management.formData.debtorComments === "hara_pago") && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-semibold text-sm text-gray-700">
                    Compromiso de pago
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">
                        Fecha prometida
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(
                          management.formData.paymentCommitmentDate || ""
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">
                        Monto prometido
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {management.formData.paymentCommitmentAmount
                          ? formatCurrency(
                              management.formData.paymentCommitmentAmount
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Próxima gestión (Condicional) */}
            {management.formData.nextManagementDate && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="font-semibold text-sm text-gray-700">
                    Próxima gestión
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Fecha</span>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(
                          management.formData.nextManagementDate || ""
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Hora</span>
                      <p className="text-sm font-medium text-gray-900">
                        {management.formData.nextManagementTime || "00:00"} hrs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comentario adicional */}
            {management.formData.comment && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Comentario
                </h4>
                <p className="text-sm text-gray-900">
                  {management.formData.comment}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
