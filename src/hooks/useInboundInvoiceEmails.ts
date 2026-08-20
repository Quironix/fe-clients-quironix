import {
  InboundInvoiceEmail,
  InboundInvoiceEmailStatus,
  InvoiceInbox,
  getInboundInvoiceEmails,
  getInvoiceInbox,
  linkInboundInvoiceEmail,
} from "@/services/inbound-invoice-emails";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const INBOUND_INVOICE_EMAILS_QUERY_KEY = "inbound-invoice-emails";
const INVOICE_INBOX_QUERY_KEY = "invoice-inbox";

export function useInboundInvoiceEmails(
  accessToken: string,
  clientId: string,
  status?: InboundInvoiceEmailStatus,
) {
  return useQuery<InboundInvoiceEmail[]>({
    queryKey: [INBOUND_INVOICE_EMAILS_QUERY_KEY, clientId, status ?? "all"],
    queryFn: () => getInboundInvoiceEmails(accessToken, clientId, status),
    enabled: !!accessToken && !!clientId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}

export function usePendingInboundInvoiceEmails(
  accessToken: string,
  clientId: string,
) {
  return useInboundInvoiceEmails(accessToken, clientId, "PENDING_REVIEW");
}

export function useInvoiceInbox(accessToken: string, clientId: string) {
  return useQuery<InvoiceInbox>({
    queryKey: [INVOICE_INBOX_QUERY_KEY, clientId],
    queryFn: () => getInvoiceInbox(accessToken, clientId),
    enabled: !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLinkInboundInvoiceEmail(
  accessToken: string,
  clientId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      debtorId,
      invoiceId,
    }: {
      id: string;
      debtorId: string;
      invoiceId?: string;
    }) =>
      linkInboundInvoiceEmail(accessToken, clientId, id, {
        debtorId,
        invoiceId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INBOUND_INVOICE_EMAILS_QUERY_KEY, clientId],
      });
    },
  });
}
