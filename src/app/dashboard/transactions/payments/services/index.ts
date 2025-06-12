import { BulkSchema } from "../../dte/types";
import { Payments } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getPayments = async (
  token: string,
  clientId: string,
  startDate: string,
  endDate: string
) => {
  let params: Record<string, string> = {};
  if (startDate) {
    params.startDate = startDate;
  }
  if (endDate) {
    params.endDate = endDate;
  }
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/payments?${new URLSearchParams(params).toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/payments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch payment");
  }

  return response.json();
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
  id: string,
  payment: Payments
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/payments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(payment),
    }
  );

  if (!response.ok) {
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
