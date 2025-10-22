/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import { ManagementFormData } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import { CONTACT_TYPE_OPTIONS } from "@/app/dashboard/debtor-management/config/management-types";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";
import { Invoice } from "@/app/dashboard/payment-plans/store";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { differenceInDays, format } from "date-fns";
import {
  BookUser,
  Calendar,
  Clock,
  Clock1,
  CogIcon,
  DollarSign,
  Eye,
  FileText,
  HashIcon,
  History,
  Mail,
  MessageCircle,
  Phone,
  ThermometerSnowflake,
  Upload,
  User2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

interface StepThreeProps {
  dataDebtor: any;
  formData: ManagementFormData;
  onFormChange: (data: Partial<ManagementFormData>) => void;
  selectedInvoices: Invoice[];
}

export const StepThree = ({
  dataDebtor,
  formData,
  onFormChange,
  selectedInvoices,
}: StepThreeProps) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [isDragging, setIsDragging] = useState(false);

  // Obtener configuración del tipo de gestión
  const selectedConfig = useMemo(() => {
    if (
      formData.managementType &&
      formData.debtorComment &&
      formData.executiveComment
    ) {
      const {
        getManagementCombination,
      } = require("@/app/dashboard/debtor-management/config/management-types");
      return getManagementCombination(
        formData.managementType,
        formData.debtorComment,
        formData.executiveComment
      );
    }
    return null;
  }, [
    formData.managementType,
    formData.debtorComment,
    formData.executiveComment,
  ]);

  // Obtener label del tipo de contacto
  const contactTypeLabel = useMemo(() => {
    const type = CONTACT_TYPE_OPTIONS.find(
      (t) => t.value === formData.contactType
    );
    return type?.label || formData.contactType;
  }, [formData.contactType]);

  const handleFileChange = (file: File | null) => {
    onFormChange({ file });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      handleFileChange(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string, formatType = "dd/MM/yyy") => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), formatType);
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    return timeString;
  };

  const calculateDelay = (dueDate: string) => {
    if (!dueDate) return 0;
    try {
      const due = new Date(dueDate);
      const today = new Date();
      const days = differenceInDays(today, due);
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  const InfoCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-2">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    </div>
  );

  /**
   * Renderiza dinámicamente los campos de case_data
   */
  const renderCaseDataFields = () => {
    if (!selectedConfig || !formData.caseData) return null;

    const fields = selectedConfig.fields;
    if (fields.length === 0) return null;

    let icon = <FileText className="w-6 h-6 text-blue-600" />;

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <BookUser className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-sm text-gray-700">
            {selectedConfig.label}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = (formData.caseData as any)[field.name];
            let displayValue = value || "-";

            // Formatear según tipo
            if (field.type === "number" && value) {
              icon = <DollarSign className="w-6 h-6 text-blue-600" />;
              displayValue = formatCurrency(value);
            } else if (field.type === "date" && value) {
              icon = <Calendar className="w-6 h-6 text-blue-600" />;
              displayValue = formatDate(value);
            } else if (field.type === "time" && value) {
              icon = <Clock className="w-6 h-6 text-blue-600" />;
              displayValue = formatTime(value);
            } else if (field.type === "select" && field.options) {
              icon = <ThermometerSnowflake className="w-6 h-6 text-blue-600" />;
              const option = field.options.find((o) => o.value === value);
              displayValue = option?.label || value || "-";
            }

            return (
              <div key={field.name} className="flex items-start gap-2">
                <IconDescription
                  icon={icon}
                  description={field.label}
                  value={displayValue}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Título y botón visualizar email */}
      <TitleStep
        icon={<Eye className="w-6 h-6" />}
        title="Vista previa de la gestión"
      />

      {/* Datos del deudor */}
      <div className="bg-blue-50 rounded-lg p-4 flex flex-col gap-5">
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            Datos del deudor
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
            <IconDescription
              icon={<HashIcon className="w-6 h-6 text-blue-600" />}
              description="Documento"
              value={dataDebtor?.debtor_code || "-"}
            />
            <IconDescription
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              description="Razón social"
              value={dataDebtor?.name || "-"}
            />
            <IconDescription
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              description="Contacto"
              value={formData.selectedContact.name || "-"}
            />
            {formData.contactType === "EMAIL" && (
              <IconDescription
                icon={<Mail className="w-6 h-6 text-blue-600" />}
                description="Contacto"
                value={formData.selectedContact.value || "-"}
              />
            )}
            {formData.contactType === "PHONE" && (
              <IconDescription
                icon={<Phone className="w-6 h-6 text-blue-600" />}
                description="Contacto"
                value={formData.selectedContact.value || "-"}
              />
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            Datos de la gestión
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
            <IconDescription
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              description="Fecha"
              value={formatDate(new Date().toISOString())}
            />
            <IconDescription
              icon={<Clock1 className="w-6 h-6 text-blue-600" />}
              description="Hora"
              value={formatDate(new Date().toLocaleString(), "HH:mm") + " hrs"}
            />
            <IconDescription
              icon={<User2 className="w-6 h-6 text-blue-600" />}
              description="Analista"
              value={"Nombre analista"}
            />
          </div>
        </div>
      </div>

      {/* Facturas seleccionadas */}
      {selectedInvoices.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Facturas seleccionadas ({selectedInvoices.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nº Doc.</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Emisión</TableHead>
                  <TableHead className="text-xs">Vto.</TableHead>
                  <TableHead className="text-xs">Monto</TableHead>
                  <TableHead className="text-xs">Saldo</TableHead>
                  <TableHead className="text-xs">Atraso</TableHead>
                  <TableHead className="text-xs">Fase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoices.map((invoice, index) => (
                  <TableRow key={index}>
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
                    <TableCell className="text-xs">
                      {calculateDelay(invoice.due_date)} días
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(invoice.phases) &&
                      invoice.phases.length > 0
                        ? ((invoice.phases[invoice.phases.length - 1] as any)
                            .phase ?? 0)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}

      {/* Tipo de Gestión */}
      {selectedConfig && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col gap-3">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CogIcon className="w-4 h-4 text-gray-700" />
                <h3 className="font-semibold text-sm text-gray-700">Gestión</h3>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <IconDescription
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  description="Tipo de gestión"
                  value={"Llamada saliente"}
                />{" "}
                <IconDescription
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  description="Comentario del deudor"
                  value={selectedConfig.description}
                />
                <IconDescription
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  description="Comentario del ejecutivo"
                  value={selectedConfig.label}
                />
              </div>
              <div className="flex flex-col gap-2 mt-5">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-700" />
                  <h3 className="font-semibold text-sm text-gray-700">
                    Observación
                  </h3>
                </div>
                <p className="text-xs italic  text-gray-600">
                  {formData.observation.charAt(0).toUpperCase() +
                    formData.observation.slice(1)}
                </p>
              </div>
            </div>
            {/* <pre>{JSON.stringify(selectedConfig, null, 2)}</pre> */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-gray-700" />
                <h3 className="font-semibold text-sm text-gray-700">
                  Próxima gestión
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <IconDescription
                  icon={<Calendar className="w-6 h-6 text-blue-600" />}
                  description="Fecha"
                  value={formatDate(formData.nextManagementDate as any)}
                />{" "}
                <IconDescription
                  icon={<Clock1 className="w-6 h-6 text-blue-600" />}
                  description="Hora"
                  value={formatTime(formData.nextManagementTime) + " hrs"}
                />
              </div>
            </div>
            {/* <pre>{JSON.stringify(selectedConfig, null, 2)}</pre> */}
          </div>
        </div>
      )}

      {/* Datos del Caso (Dinámico) */}
      {renderCaseDataFields()}

      {/* Subir archivo */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Selecciona el archivo desde tu ordenador en JPG, PNG o GIF (Máximo
            5mb).
          </p>
          <label className="inline-block">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && isValidFile(file)) {
                  handleFileChange(file);
                }
              }}
            />
            <span className="px-4 py-2 bg-white border-2 border-orange-400 text-orange-600 rounded-md cursor-pointer hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Subir archivo
            </span>
          </label>
          {formData.file && (
            <p className="text-sm text-green-600 mt-2">
              Archivo seleccionado: {formData.file.name}
            </p>
          )}
        </div>
      </div>

      {/* Comentario */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <Label htmlFor="comment" className="text-sm font-semibold mb-2 block">
          Comentario adicional
        </Label>
        <Textarea
          id="comment"
          placeholder="Escribe algún comentario adicional sobre esta gestión..."
          value={formData.comment || ""}
          onChange={(e) => onFormChange({ comment: e.target.value })}
          className="min-h-[120px] resize-none"
        />
      </div>

      {/* Checkbox enviar email */}
      <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
        <Checkbox
          id="sendEmail"
          checked={formData.sendEmail || false}
          onCheckedChange={(checked) =>
            onFormChange({ sendEmail: checked as boolean })
          }
        />
        <label
          htmlFor="sendEmail"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          <Mail className="w-4 h-4 inline mr-1" />
          Enviar resumen por email después de guardar.
        </label>
      </div>
    </div>
  );
};
