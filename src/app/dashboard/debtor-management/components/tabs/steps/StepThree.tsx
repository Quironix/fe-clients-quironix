"use client";

import { ManagementFormData } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
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
import { format } from "date-fns";
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
import { differenceInDays } from "date-fns";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface StepThreeProps {
  dataDebtor: any;
  formData: ManagementFormData;
  onFormChange: (data: Partial<ManagementFormData>) => void;
  selectedInvoices: Invoice[];
}

// Mapeo de labels para tipos de gestión
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

export const StepThree = ({
  dataDebtor,
  formData,
  onFormChange,
  selectedInvoices,
}: StepThreeProps) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [isDragging, setIsDragging] = useState(false);

  // Determinar si mostrar secciones condicionales
  const showPaymentCommitment =
    formData.analystComments === "con_compromiso_pago" ||
    formData.debtorComments === "hara_pago";

  const showNextManagement =
    formData.managementType &&
    formData.debtorComments &&
    formData.analystComments;

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

      {/* Facturas seleccionadas */}
      {selectedInvoices.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Facturas seleccionadas
            </h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nº Doc.</TableHead>
                  <TableHead className="text-xs">Emisión</TableHead>
                  <TableHead className="text-xs">Vto.</TableHead>
                  <TableHead className="text-xs">Monto</TableHead>
                  <TableHead className="text-xs">Saldo</TableHead>
                  <TableHead className="text-xs">Atraso</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Observaciones</TableHead>
                  <TableHead className="text-xs">Moneda</TableHead>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs">Seg.</TableHead>
                  <TableHead className="text-xs">Puntaje</TableHead>
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
                      {calculateDelay(invoice.due_date)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <DocumentTypeBadge type={invoice.type} />
                    </TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs">P</TableCell>
                    <TableCell className="text-xs">
                      {invoice.client_id || "545484"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        Estado
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(invoice.issue_date)}
                    </TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs">0</TableCell>
                    <TableCell className="text-xs">-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Gestión */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-sm text-gray-700">Gestión</h3>
          <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-gray-400 rounded-sm"></div>
            <div className="flex-1">
              <span className="text-xs text-gray-500">Tipo de gestión</span>
              <p className="text-sm font-medium text-gray-900">
                {managementTypeLabels[formData.managementType] || "-"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">
                  Comentario del deudor
                </span>
                <p className="text-sm text-gray-900">
                  {debtorCommentsLabels[formData.debtorComments] || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">
                  Comentario del analista
                </span>
                <p className="text-sm text-gray-900">
                  {analystCommentsLabels[formData.analystComments] || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compromiso de pago (Condicional) */}
      {showPaymentCommitment && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CircleDollarSign className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Compromiso de pago
            </h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <CalendarDays className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Fecha prometida</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(formData.paymentCommitmentDate || "")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CircleDollarSign className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Monto prometido</span>
                <p className="text-sm font-medium text-gray-900">
                  {formData.paymentCommitmentAmount
                    ? formatCurrency(formData.paymentCommitmentAmount)
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Próxima gestión (Condicional) */}
      {showNextManagement && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Próxima gestión
            </h3>
            <MessageSquare className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <CalendarDays className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Fecha</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(formData.nextManagementDate || "")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Hora</span>
                <p className="text-sm font-medium text-gray-900">
                  {formData.nextManagementTime || "00:00"} hrs
                </p>
              </div>
            </div>
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
          Comentario
        </Label>
        <Textarea
          id="comment"
          placeholder="Lorem ipsum dolor sit amet consectetur. Tristique tincidunt aliquet ut proin..."
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
