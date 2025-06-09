import { BankInformationRequest } from "./types";

export const getAll = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-informations`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bank information");
  }

  return response.json();
};

export const create = async (
  accessToken: string,
  bankInfo: BankInformationRequest,
  clientId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-informations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bankInfo),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create bank information");
  }

  return response.json();
};

export const update = async (
  accessToken: string,
  bankInfoId: string,
  bankInfo: BankInformationRequest,
  clientId: string
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-informations/${bankInfoId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankInfo),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to update bank information: ${response.status} ${errorData}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error al actualizar información bancaria:", error);
    throw error;
  }
};

export const remove = async (
  accessToken: string,
  bankInfoId: string,
  clientId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-informations/${bankInfoId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete bank information");
  }
};
