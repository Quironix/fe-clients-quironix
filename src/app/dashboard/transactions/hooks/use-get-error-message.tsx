"use client";
export const useGetErrorMessage = () => {
  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      IS_REQUIRED: "Campo requerido",
      INVALID_FORMAT: "Formato inválido",
      INVALID_EMAIL: "Email inválido",
      INVALID_PHONE: "Teléfono inválido",
      DUPLICATE_VALUE: "Valor duplicado",
      INVALID_LENGTH: "Longitud inválida",
      INVALID_NUMBER: "Número inválido",
      INVALID_BOOLEAN: "Booleano inválido",
      INVALID_DATE: "Fecha inválida",
      INVALID_ENUM: "Valor no válido",
      INVALID_INVOICE_TYPE: "Tipo de factura inválido",
      DEBTOR_NOT_FOUND: "Deudor no encontrado",
      CLIENT_CODE_NOT_FOUND: "Código de cliente no encontrado",
      INVOICE_ALREADY_EXISTS: "Factura ya existe",
      DOCUMENT_TYPE_NOT_FOUND: "Tipo de documento no encontrado",
      PAYMENT_ALREADY_EXISTS: "Pago ya existe",
      BANK_NOT_FOUND: "Banco no encontrado",
      USER_NOT_FOUND: "Usuario no encontrado",
      BANK_ACCOUNT_NOT_FOUND: "Cuenta bancaria no encontrada",
    };
    return errorMessages[errorCode] || errorCode;
  };

  return { getErrorMessage };
};
