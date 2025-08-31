import { DocumentType, INVOICE_TYPES } from "@/app/dashboard/data";
import { Badge } from "@/components/ui/badge";

// Crear tipo unión que combine todos los valores posibles de tipos de documentos
type InvoiceTypeValues = (typeof INVOICE_TYPES)[0]["types"][number]["value"];
type PaymentDocumentTypes = keyof typeof DocumentType;
type AllDocumentTypes = InvoiceTypeValues | PaymentDocumentTypes | string;

interface DocumentTypeBadgeProps {
  type: AllDocumentTypes;
}

// Función centralizada para obtener texto y color según el tipo de documento
const getDocumentTypeDisplayData = (type: AllDocumentTypes) => {
  // Mapeo para tipos de facturas (INVOICE_TYPES)
  const invoiceTypeMapping: Record<string, { text: string; color: string }> = {
    INVOICE: { text: "Factura", color: "pink" },
    EXEMPT_INVOICE: { text: "Fac. exenta", color: "purple" },
    PURCHASE_INVOICE: { text: "Fac. de compra", color: "purple" },
    SETTLEMENT_INVOICE: { text: "Liquidación", color: "purple" },
    EXPORT_INVOICE: { text: "Fac. de exportación", color: "purple" },
    DEBIT_NOTE: { text: "N. de débito", color: "blue" },
    CREDIT_NOTE: { text: "N. de crédito", color: "pink" },
    DISPATCH_GUIDE: { text: "Guía despacho", color: "green" },
    EXPORT_CREDIT_NOTE: { text: "N. de crédito de exp.", color: "purple" },
    EXPORT_DEBIT_NOTE: { text: "N. de débito de exp.", color: "cyan" },
  };

  // Mapeo para tipos de pagos (DocumentType enum)
  const paymentTypeMapping: Record<string, { text: string; color: string }> = {
    CHECK: { text: "Cheque", color: "orange" },
    DEPOSIT: { text: "Depósito", color: "blue" },
    CASH: { text: "Efectivo", color: "green" },
    SIGHT_DRAFT: { text: "Vale Vista", color: "blue" },
    BILL_OF_EXCHANGE: { text: "Letra", color: "gray" },
    PROMISSORY_NOTE: { text: "Pagaré", color: "green" },
    APPLICATION: { text: "Aplicación", color: "gray" },
    ADJUSTMENT: { text: "Ajuste", color: "gray" },
    TRANSFER: { text: "Transferencia", color: "blue" },
    CREDIT_CARD: { text: "Tarjeta Crédito", color: "purple" },
    DEBIT_CARD: { text: "Tarjeta Débito", color: "blue" },
    TAX_WITHHOLDING: { text: "Retención", color: "blue" },
    BANK_EXPENSE: { text: "Gasto Bancario", color: "red" },
    POST_DATED_CHECK: { text: "Cheque A Fecha", color: "orange" },
    DEBT_COLLECTION: { text: "Cobro Deuda", color: "red" },
    INTEREST: { text: "Intereses", color: "yellow" },
    CREDIT_NOTE: { text: "Abono", color: "pink" },
    PAYMENT: { text: "Abono", color: "pink" },
    PAYMENT_PLAN_INSTALLMENT: { text: "Pago de cuota", color: "blue" },
  };

  // Mapeo para tipos legacy/strings en español (para compatibilidad)
  const legacyTypeMapping: Record<string, { text: string; color: string }> = {
    Factura: { text: "Factura", color: "pink" },
    "Fac. exenta": { text: "Fac. exenta", color: "purple" },
    "Fac. de exportación": { text: "Fac. de exportación", color: "purple" },
    "N. de débito": { text: "N. de débito", color: "blue" },
    "N. de débito de exp.": { text: "N. de débito de exp.", color: "cyan" },
    Pagaré: { text: "Pagaré", color: "green" },
    "Cheque protestado": { text: "Cheque protestado", color: "orange" },
    "N. de crédito": { text: "N. de crédito", color: "pink" },
    "N. de crédito de exp.": { text: "N. de crédito de exp.", color: "purple" },
    Anticipo: { text: "Anticipo", color: "green" },
    Retención: { text: "Retención", color: "blue" },
    "Fac. comercial": { text: "Fac. comercial", color: "orange" },
  };

  // Buscar en los mapeos en orden de prioridad
  return (
    invoiceTypeMapping[type] ||
    paymentTypeMapping[type] ||
    legacyTypeMapping[type] || { text: type, color: "gray" } // Fallback para tipos no reconocidos
  );
};

// Función para generar las clases CSS basadas en el color
const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    pink: "bg-pink-200 text-pink-600 border-pink-300",
    purple: "bg-purple-200 text-purple-600 border-purple-300",
    blue: "bg-blue-200 text-blue-700 border-blue-300",
    cyan: "bg-cyan-200 text-cyan-700 border-cyan-300",
    green: "bg-green-200 text-green-700 border-green-300",
    orange: "bg-orange-200 text-orange-700 border-orange-300",
    gray: "bg-gray-200 text-gray-700 border-gray-300",
    red: "bg-red-200 text-red-700 border-red-300",
    yellow: "bg-yellow-200 text-yellow-700 border-yellow-300",
  };

  return colorMap[color] || colorMap.gray;
};

const DocumentTypeBadge = ({ type }: DocumentTypeBadgeProps) => {
  const { text, color } = getDocumentTypeDisplayData(type);
  const colorClasses = getColorClasses(color);

  return (
    <Badge
      variant="outline"
      className={`${colorClasses} border rounded-full min-w-[100px] max-w-[100px] truncate text-center p-0`}
    >
      <span className="text-[10px] font-bold">{text}</span>
    </Badge>
  );
};

export default DocumentTypeBadge;
export type { AllDocumentTypes as DocumentType };
