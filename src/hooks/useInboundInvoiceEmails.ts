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
  getEmailOriginal,
  getInboundEmailReplies,
  resolveInboundEmailReply,
  type EmailChannel,
  type EmailOriginal,
  type TrackEmailMessage,
} from "@/services/inbound-email-replies";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const INBOUND_INVOICE_EMAILS_QUERY_KEY = "inbound-invoice-emails";
const INBOUND_EMAIL_REPLIES_QUERY_KEY = "inbound-email-replies";
const INVOICE_INBOX_QUERY_KEY = "invoice-inbox";
const EMAIL_ORIGINAL_QUERY_KEY = "email-original";
const SENT_EMAILS_QUERY_KEY = "sent-emails";

export function useEmailOriginal(
  accessToken: string,
  clientId: string,
  channel: EmailChannel,
  id: string,
) {
  return useQuery<EmailOriginal>({
    queryKey: [EMAIL_ORIGINAL_QUERY_KEY, clientId, channel, id],
    queryFn: () => getEmailOriginal(accessToken, clientId, channel, id),
    enabled: !!accessToken && !!clientId && !!id,
    staleTime: Infinity,
  });
}

export function useInboundEmailReplies(
  accessToken: string,
  clientId: string,
  search?: string,
) {
  return useQuery<TrackEmailMessage[]>({
    queryKey: [INBOUND_EMAIL_REPLIES_QUERY_KEY, clientId, search ?? ""],
    queryFn: () => getInboundEmailReplies(accessToken, clientId, { search }),
    enabled: !!accessToken && !!clientId,
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}

export function useSentEmails(
  accessToken: string,
  clientId: string,
  search: string | undefined,
  limit: number,
) {
  return useQuery<TrackEmailMessage[]>({
    queryKey: [SENT_EMAILS_QUERY_KEY, clientId, search ?? "", limit],
    queryFn: () =>
      getInboundEmailReplies(accessToken, clientId, {
        search,
        direction: "OUT",
        limit,
      }),
    enabled: !!accessToken && !!clientId,
    placeholderData: keepPreviousData,
  });
}

export function useResolveInboundEmail(accessToken: string, clientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    InboundInvoiceEmail | TrackEmailMessage,
    Error,
    { id: string; channel: "FINANZAS" | "COBRANZA"; resolved: boolean }
  >({
    mutationFn: ({ id, channel, resolved }) =>
      channel === "FINANZAS"
        ? resolveInboundInvoiceEmail(accessToken, clientId, id, resolved)
        : resolveInboundEmailReply(accessToken, clientId, id, resolved),
    onSuccess: (_data, { id, channel, resolved }) => {
      const key =
        channel === "FINANZAS"
          ? INBOUND_INVOICE_EMAILS_QUERY_KEY
          : INBOUND_EMAIL_REPLIES_QUERY_KEY;
      const nextResolvedAt = resolved ? new Date().toISOString() : null;
      queryClient.setQueriesData<
        Array<{ id: string; resolved_at?: string | null }>
      >({ queryKey: [key, clientId] }, (old) =>
        old?.map((row) =>
          row.id === id ? { ...row, resolved_at: nextResolvedAt } : row,
        ),
      );
      queryClient.invalidateQueries({
        queryKey: [INBOUND_INVOICE_EMAILS_QUERY_KEY, clientId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: [INBOUND_EMAIL_REPLIES_QUERY_KEY, clientId],
        refetchType: "all",
      });
    },
  });
}

export function useInboundInvoiceEmails(
  accessToken: string,
  clientId: string,
  status?: InboundInvoiceEmailStatus,
  search?: string,
) {
  return useQuery<InboundInvoiceEmail[]>({
    queryKey: [
      INBOUND_INVOICE_EMAILS_QUERY_KEY,
      clientId,
      status ?? "all",
      search ?? "",
    ],
    queryFn: () =>
      getInboundInvoiceEmails(accessToken, clientId, { status, search }),
    enabled: !!accessToken && !!clientId,
    placeholderData: keepPreviousData,
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
