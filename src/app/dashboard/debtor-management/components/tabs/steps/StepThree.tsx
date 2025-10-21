"use client";

import { ManagementFormData } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import { CONTACT_TYPE_OPTIONS } from "@/app/dashboard/debtor-management/config/management-types";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import { Invoice } from "@/app/dashboard/payment-plans/store";
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
  CalendarDays,
  CircleDollarSign,
  Clock,
  Eye,
  FileText,
  Hash,
  Mail,
  MessageSquare,
  Phone,
  Upload,
  User,
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
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

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-sm text-gray-700">
            Detalles: {selectedConfig.label}
          </h3>
          <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = (formData.caseData as any)[field.name];
            let displayValue = value || "-";

            // Formatear según tipo
            if (field.type === "number" && value) {
              displayValue = formatCurrency(value);
            } else if (field.type === "date" && value) {
              displayValue = formatDate(value);
            } else if (field.type === "time" && value) {
              displayValue = formatTime(value);
            } else if (field.type === "select" && field.options) {
              const option = field.options.find((o) => o.value === value);
              displayValue = option?.label || value || "-";
            }

            return (
              <div key={field.name} className="flex items-start gap-2">
                <CircleDollarSign className="w-4 h-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <span className="text-xs text-gray-500">{field.label}</span>
                  <p className="text-sm font-medium text-gray-900">
                    {displayValue}
                  </p>
                </div>
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Vista previa de la gestión
          </h2>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
          onClick={() => {
            // TODO: Implementar visualización de email
            console.log("Visualizar email");
          }}
        >
          <Mail className="w-4 h-4" />
          Visualizar email
        </button>
      </div>

      {/* Datos del deudor */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">
          Datos del deudor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoCard
            icon={<Hash className="w-4 h-4" />}
            label="Documento"
            value={dataDebtor?.debtor_code || "-"}
          />
          <InfoCard
            icon={<FileText className="w-4 h-4" />}
            label="Razón Social"
            value={dataDebtor?.name || "-"}
          />
          <InfoCard
            icon={<User className="w-4 h-4" />}
            label="Contacto"
            value={dataDebtor?.contact_name || "-"}
          />
          <InfoCard
            icon={<Phone className="w-4 h-4" />}
            label="Teléfono"
            value={dataDebtor?.phone || "-"}
          />
        </div>
      </div>

      {/* Datos de la gestión */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">
          Datos de la gestión
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={<CalendarDays className="w-4 h-4" />}
            label="Fecha"
            value={format(new Date(), "dd/MM/yyyy")}
          />
          <InfoCard
            icon={<Clock className="w-4 h-4" />}
            label="Hora"
            value={format(new Date(), "HH:mm")}
          />
          <InfoCard
            icon={<User className="w-4 h-4" />}
            label="Analista"
            value={profile?.user?.name || "-"}
          />
        </div>
      </div>

      {/* Tipo de Gestión */}
      {selectedConfig && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Tipo de gestión
            </h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
          <div className="space-y-2">
            <InfoCard
              icon={<FileText className="w-4 h-4" />}
              label="Tipo"
              value={selectedConfig.label}
            />
            <InfoCard
              icon={<MessageSquare className="w-4 h-4" />}
              label="Descripción"
              value={selectedConfig.description}
            />
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
              <p className="text-sm text-blue-800">
                <strong>Fase objetivo:</strong> {selectedConfig.targetPhase}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contacto */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-sm text-gray-700">Contacto</h3>
          <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon={<FileText className="w-4 h-4" />}
            label="Tipo"
            value={contactTypeLabel}
          />
          <InfoCard
            icon={<MessageSquare className="w-4 h-4" />}
            label="Valor"
            value={formData.contactValue || "-"}
          />
        </div>
      </div>

      {/* Observación */}
      {formData.observation && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">Observación</h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
          <p className="text-sm text-gray-900">{formData.observation}</p>
        </div>
      )}

      {/* Datos del Caso (Dinámico) */}
      {renderCaseDataFields()}

      {/* Próxima gestión */}
      {formData.nextManagementDate && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Próxima gestión
            </h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              icon={<CalendarDays className="w-4 h-4" />}
              label="Fecha"
              value={formatDate(formData.nextManagementDate)}
            />
            <InfoCard
              icon={<Clock className="w-4 h-4" />}
              label="Hora"
              value={formatTime(formData.nextManagementTime) + " hrs"}
            />
          </div>
        </div>
      )}

      {/* Facturas seleccionadas */}
      {selectedInvoices.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Facturas seleccionadas ({selectedInvoices.length})
            </h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
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
