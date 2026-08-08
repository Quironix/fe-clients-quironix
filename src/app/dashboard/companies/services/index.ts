import { BulkSchema } from "@/app/dashboard/transactions/dte/types";
import { Company } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const bulkData = async (
  accessToken: string,
  clientId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schemaType", BulkSchema.COMPANIES);

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
        code: "ERROR_BULK_COMPANIES",
      })
    );
  }
  return response.json();
};

export const getCompanies = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/companies`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  // The BFF proxy may return HTTP 200 with an error body containing the real statusCode
  const effectiveStatus = !response.ok ? response.status : (data?.statusCode ?? response.status);

  if (effectiveStatus >= 400) {
    throw new HttpError(effectiveStatus, data?.message ?? `Error ${effectiveStatus}`);
  }

  return data;
};

export const getCompanyById = async (
  accessToken: string,
  clientId: string,
  companyId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/companies/${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.json();
};

export const createCompany = async (
  accessToken: string,
  clientId: string,
  company: Company
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/companies`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(company),
    }
  );
  return response.json();
};

export const updateCompany = async (
  accessToken: string,
  clientId: string,
  companyId: string,
  company: Company
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/companies/${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(company),
    }
  );
  return response.json();
};

export const deleteCompany = async (
  accessToken: string,
  clientId: string,
  companyId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/companies/${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    }
  );
  return response.json();
};
