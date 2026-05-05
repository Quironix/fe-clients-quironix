import { BankInformation } from "@/app/dashboard/banks/services/types";
import { getAll as getAllBankInformations } from "@/app/dashboard/banks/services";

interface FormattedBankInfo {
  bank: string;
  account_number: string;
  account_type: string;
  holder_name: string;
  contact_email: string;
}

/**
 * Fetches bank information from the backend and formats it for email templates
 * @param token - Bearer token for authentication
 * @param clientId - Client ID
 * @param clientName - Client name for holder_name field
 * @param clientEmail - Client email for contact
 * @returns Formatted bank information or null if no banks found
 */
export async function fetchAndFormatBankInfo(
  token: string,
  clientId: string,
  clientName: string,
  clientEmail: string
): Promise<FormattedBankInfo | null> {
  try {
    const bankInfos: BankInformation[] = await getAllBankInformations(token, clientId);
    
    // Return null if no bank information exists
    if (!bankInfos || bankInfos.length === 0) {
      console.warn(`No bank information found for client ${clientId}`);
      return null;
    }

    // Use the first bank account (most common scenario)
    const primaryBank = bankInfos[0];

    return {
      bank: primaryBank.bank,
      account_number: primaryBank.account_number,
      account_type: "Cuenta Corriente", // All accounts are "Cuenta Corriente" per requirements
      holder_name: clientName,
      contact_email: clientEmail,
    };
  } catch (error) {
    console.error("Error fetching bank information:", error);
    return null;
  }
}

/**
 * Generates HTML block for bank account information to be used in email templates
 * @param bankInfo - Formatted bank information
 * @returns HTML string with bank details
 */
export function generateBankInfoHTML(bankInfo: FormattedBankInfo | null): string {
  if (!bankInfo) {
    return '<p><em>Información bancaria no disponible. Contacte al área de cobranza.</em></p>';
  }

  return `
    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 10px 0;">
      <p style="margin: 5px 0;"><strong>Banco:</strong> ${bankInfo.bank}</p>
      <p style="margin: 5px 0;"><strong>Tipo de Cuenta:</strong> ${bankInfo.account_type}</p>
      <p style="margin: 5px 0;"><strong>Número de Cuenta:</strong> ${bankInfo.account_number}</p>
      <p style="margin: 5px 0;"><strong>Titular:</strong> ${bankInfo.holder_name}</p>
      <p style="margin: 5px 0;"><strong>Email de contacto:</strong> ${bankInfo.contact_email}</p>
    </div>
  `;
}

/**
 * Generates simplified bank info text for inline use in email body
 * @param bankInfo - Formatted bank information
 * @returns Plain text string with bank details
 */
export function generateBankInfoText(bankInfo: FormattedBankInfo | null): string {
  if (!bankInfo) {
    return 'Información bancaria no disponible.';
  }

  return `${bankInfo.bank} - Cuenta Corriente N° ${bankInfo.account_number} a nombre de ${bankInfo.holder_name}`;
}
