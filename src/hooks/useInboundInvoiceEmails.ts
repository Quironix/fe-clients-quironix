import {
  InboundInvoiceEmail,
  InboundInvoiceEmailStatus,
  InvoiceInbox,
  getInboundInvoiceEmails,
  getInvoiceInbox,
  linkInboundInvoiceEmail,
  resolveInboundInvoiceEmail,
} from "@/services/inbound-invoice-emails";
import {
  getInboundEmailReplies,
  resolveInboundEmailReply,
  type TrackEmailMessage,
} from "@/services/inbound-email-replies";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const INBOUND_INVOICE_EMAILS_QUERY_KEY = "inbound-invoice-emails";
const INBOUND_EMAIL_REPLIES_QUERY_KEY = "inbound-email-replies";
const INVOICE_INBOX_QUERY_KEY = "invoice-inbox";

export function useInboundEmailReplies(accessToken: string, clientId: string) {
  return useQuery<TrackEmailMessage[]>({
    queryKey: [INBOUND_EMAIL_REPLIES_QUERY_KEY, clientId],
    queryFn: () => getInboundEmailReplies(accessToken, clientId),
    enabled: !!accessToken && !!clientId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}

export function useResolveInboundEmail(accessToken: string, clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      channel,
      resolved,
    }: {
      id: string;
      channel: "FINANZAS" | "COBRANZA";
      resolved: boolean;
    }) =>
      channel === "FINANZAS"
        ? resolveInboundInvoiceEmail(accessToken, clientId, id, resolved)
        : resolveInboundEmailReply(accessToken, clientId, id, resolved),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INBOUND_INVOICE_EMAILS_QUERY_KEY, clientId],
      });
      queryClient.invalidateQueries({
        queryKey: [INBOUND_EMAIL_REPLIES_QUERY_KEY, clientId],
      });
    },
  });
}

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
