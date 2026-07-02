/**
 * Service for SIP call external ID retrieval
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SipCallExternalIdResponse {
  status: string;
  extension: string;
  uniqueid: string | null;
}

/**
 * Fetches the PBX uniqueid for the most recent SIP call associated with a client.
 *
 * @param accessToken - Bearer token for authentication
 * @param clientId - The client ID to look up the SIP call for
 * @returns Resolved SIP call information including the uniqueid
 * @throws Error if the HTTP response is not OK
 */
export async function getSipCallExternalId(
  accessToken: string,
  clientId: string
): Promise<SipCallExternalIdResponse> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/sip-call-external-id`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Error fetching SIP call external ID: ${response.statusText}`
    );
  }

  return response.json();
}
