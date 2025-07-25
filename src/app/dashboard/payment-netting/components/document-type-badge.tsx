import { Badge } from "@/components/ui/badge";

type DocumentType =
  | "Factura"
  | "Fac. exenta"
  | "Fac. de exportación"
  | "N. de débito"
  | "N. de débito de exp."
  | "Pagaré"
  | "Cheque protestado"
  | "N. de crédito"
  | "N. de crédito de exp."
  | "Anticipo"
  | "Retención"
  | "Fac. comercial"
  | "CREDIT_NOTE";

interface DocumentTypeBadgeProps {
  type: DocumentType;
}

const DocumentTypeBadge = ({ type }: DocumentTypeBadgeProps) => {
  const getDocumentTypeStyles = (docType: DocumentType) => {
    const styles = {
      Factura: {
        className:
          "bg-pink-200 text-pink-600 border border-pink-300 rounded-full",
        text: "Factura",
      },
      "Fac. exenta": {
        className:
          "bg-purple-200 text-purple-600 border border-purple-300 rounded-full",
        text: "Fac. exenta",
      },
      "Fac. de exportación": {
        className:
          "bg-purple-300 text-purple-800 border border-purple-400 rounded-full",
        text: "Fac. de exportación",
      },
      "N. de débito": {
        className:
          "bg-blue-200 text-blue-700 border border-blue-300 rounded-full",
        text: "N. de débito",
      },
      "N. de débito de exp.": {
        className:
          "bg-cyan-200 text-cyan-700 border border-cyan-300 rounded-full",
        text: "N. de débito de exp.",
      },
      Pagaré: {
        className:
          "bg-green-200 text-green-700 border border-green-300 rounded-full",
        text: "Pagaré",
      },
      "Cheque protestado": {
        className:
          "bg-orange-200 text-orange-700 border border-orange-300 rounded-full",
        text: "Cheque protestado",
      },
      CREDIT_NOTE: {
        className:
          "bg-pink-200 text-pink-600 border border-pink-300 rounded-full",
        text: "N. de crédito",
      },
      "N. de crédito": {
        className:
          "bg-pink-200 text-pink-600 border border-pink-300 rounded-full",
        text: "N. de crédito",
      },
      "N. de crédito de exp.": {
        className:
          "bg-purple-200 text-purple-600 border border-purple-300 rounded-full",
        text: "N. de crédito de exp.",
      },
      Anticipo: {
        className:
          "bg-green-300 text-green-800 border border-green-400 rounded-full",
        text: "Anticipo",
      },
      Retención: {
        className:
          "bg-blue-200 text-blue-700 border border-blue-300 rounded-full",
        text: "Retención",
      },
      "Fac. comercial": {
        className:
          "bg-orange-200 text-orange-700 border border-orange-300 rounded-full",
        text: "Fac. comercial",
      },
    };

    return styles[docType] || styles["Factura"];
  };

  const { className, text } = getDocumentTypeStyles(type);

  return (
    <Badge variant="outline" className={className}>
      <span className="text-xs font-bold">{text}</span>
    </Badge>
  );
};

export default DocumentTypeBadge;
export type { DocumentType };
