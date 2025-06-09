import { BulkSchema } from "../types";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const bulkData = async (
  accessToken: string,
  clientId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schemaType", BulkSchema.INVOICES);

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

export const getDTEs = async (accessToken: string, clientId: string) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/invoices`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch DTE");
  }
  return response.json();
};
