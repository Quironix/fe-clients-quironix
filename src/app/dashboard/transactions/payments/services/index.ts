import { BulkSchema } from "../../dte/types";
import { Payments } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PaymentsPaginationParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const getPayments = async (
  token: string,
  clientId: string,
  params?: PaymentsPaginationParams
) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/v2/clients/${clientId}/payments${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
};

export const getBankInformation = async (token: string, clientId: string) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/bank-informations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bank information");
  }

  return response.json();
};

export const getPaymentById = async (
  token: string,
  clientId: string,
  id: string
) => {
  const url = `${API_URL}/v2/clients/${clientId}/payments/${id}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch payment: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  // Verificar diferentes estructuras posibles de respuesta
  if (data) {
    // Si la respuesta tiene la estructura { data: {...} }
    if (data.data) {
      return data;
    }
    // Si la respuesta es directamente el objeto del pago
    else if (data.id || data.payment_number) {
      return { data: data };
    }
    // Si no tiene ninguna de las estructuras esperadas
    else {
      return { data: data };
    }
  }

  throw new Error("Invalid response format");
};

export const createPayment = async (
  token: string,
  clientId: string,
  payment: Payments
) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payment),
  });

  if (!response) {
    throw new Error("Failed to create payment");
  }

  return response.json();
};

export const updatePayment = async (
  token: string,
  clientId: string,
  payment: Payments
) => {
  if (!payment?.id) {
    throw new Error("Payment ID is required");
  }
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/payments/${payment?.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(payment),
    }
  );

  if (!response) {
    throw new Error("Failed to update payment");
  }

  return response.json();
};

export const bulkData = async (
  accessToken: string,
  clientId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schemaType", BulkSchema.PAYMENTS);

  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/file-processing/upload`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: formData,
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      JSON.stringify({
        message: error.message || "Error al cargar el archivo",
        code: "ERROR_BULK_PAYMENTS",
      })
    );
  }
  return response.json();
};

export const deletePayment = async (
  accessToken: string,
  clientId: string,
  id: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/payments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    }
  );
  if (!response) {
    throw new Error("Failed to delete payment");
  }
  return response.json();
};
