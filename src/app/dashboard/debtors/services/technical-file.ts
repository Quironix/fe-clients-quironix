import type {
  ContactRole,
  PaymentProfile,
  Salesperson,
  SalespersonInput,
  SharedContactImpact,
  SuggestedContact,
} from "../types/technical-file";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  accessToken: string,
  path: string,
  init?: { method: string; body: unknown },
): Promise<T> {
  const response = await fetch(`${API_URL}/v2/clients/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init && { "Content-Type": "application/json" }),
    },
    ...(init && { body: JSON.stringify(init.body) }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? `Error ${response.status}`);
  }
  const body = await response.json();
  if (body?.statusCode >= 400)
    throw new Error(body.message ?? `Error ${body.statusCode}`);
  return body;
}

export const getContactRoles = (accessToken: string, clientId: string) =>
  request<ContactRole[]>(accessToken, `${clientId}/contact-roles`);

export const getPaymentProfile = (
  accessToken: string,
  clientId: string,
  debtorId: string,
) =>
  request<PaymentProfile>(
    accessToken,
    `${clientId}/debtors/${debtorId}/payment-profile`,
  );

export const getSuggestedContact = async (
  accessToken: string,
  clientId: string,
  debtorId: string,
  invoiceIds: string[],
): Promise<SuggestedContact | null> => {
  const { suggestion } = await request<{ suggestion: SuggestedContact | null }>(
    accessToken,
    `${clientId}/debtors/${debtorId}/suggested-contact?invoice_ids=${invoiceIds.join(",")}`,
  );
  return suggestion;
};

export const getSharedContactImpact = (
  accessToken: string,
  clientId: string,
  debtorId: string,
  contactId: string,
) =>
  request<SharedContactImpact>(
    accessToken,
    `${clientId}/debtors/${debtorId}/contacts/${contactId}/impact`,
  );

export const linkSharedContact = (
  accessToken: string,
  clientId: string,
  debtorId: string,
  contactId: string,
  targetDebtorId: string,
) =>
  request(
    accessToken,
    `${clientId}/debtors/${debtorId}/contacts/${contactId}/link`,
    {
      method: "POST",
      body: { target_debtor_id: targetDebtorId },
    },
  );

export const getSalespeople = (accessToken: string, clientId: string) =>
  request<Salesperson[]>(accessToken, `${clientId}/salespeople`);

export const createSalesperson = (
  accessToken: string,
  clientId: string,
  salesperson: SalespersonInput,
) =>
  request<Salesperson>(accessToken, `${clientId}/salespeople`, {
    method: "POST",
    body: salesperson,
  });

export const updateSalesperson = (
  accessToken: string,
  clientId: string,
  salespersonId: string,
  salesperson: SalespersonInput,
) =>
  request<Salesperson>(
    accessToken,
    `${clientId}/salespeople/${salespersonId}`,
    {
      method: "PUT",
      body: salesperson,
    },
  );
