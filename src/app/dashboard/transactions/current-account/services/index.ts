import { AccountStatementResponse, AccountStatementStatus } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AccountStatementParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountStatementStatus;
}

export const getAccountStatement = async (
  accessToken: string,
  clientId: string,
  debtorId: string,
  params?: AccountStatementParams
): Promise<AccountStatementResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const url = `${API_URL}/v2/clients/${clientId}/reconciliation/debtors/${debtorId}/account-statement${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch account statement");
  }

  return response.json();
};

interface AccountStatementAllDebtorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountStatementStatus;
}

export const getAccountStatementAllDebtors = async (
  accessToken: string,
  clientId: string,
  params?: AccountStatementAllDebtorsParams
): Promise<AccountStatementResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const url = `${API_URL}/v2/clients/${clientId}/reconciliation/account-statement${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch account statement (all debtors)");
  }

  return response.json();
};
