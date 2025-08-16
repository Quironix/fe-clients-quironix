import { INVOICE_TYPES } from "@/app/dashboard/data";

export const getDocumentTypeCode = (documentType: string) => {
  const documentTypeCode = INVOICE_TYPES.find((type) =>
    type.types.find((t) => t.value === documentType)
  );
  return documentTypeCode?.types.find((t) => t.value === documentType)?.code;
};
