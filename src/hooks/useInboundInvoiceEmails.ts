import { mergeInboxPages } from "@/app/dashboard/invoice-inbox/lib/unified-inbox";
import {
  InboundInvoiceEmail,
  InvoiceInbox,
  getInboundInvoiceEmail,
  getInboundInvoiceEmails,
  getInvoiceInbox,
  linkInboundInvoiceEmail,
  resolveInboundInvoiceEmail,
} from "@/services/inbound-invoice-emails";
import {
  getEmailOriginal,
  getInboundEmailReplies,
  getInboundEmailReply,
  resolveInboundEmailReply,
  type EmailChannel,
  type EmailOriginal,
  type TrackEmailMessage,
} from "@/services/inbound-email-replies";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

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
  { search, pending }: { search?: string; pending?: boolean } = {},
) {
  return usePagedInbox<TrackEmailMessage>(
    [
      INBOUND_EMAIL_REPLIES_QUERY_KEY,
      clientId,
      pending ? "pending" : "all",
      search ?? "",
    ],
    (before) =>
      getInboundEmailReplies(accessToken, clientId, {
        search,
        pending,
        before,
        limit: INBOX_PAGE_SIZE,
      }),
    { enabled: !!accessToken && !!clientId, poll: true },
  );
}

export function useSentEmails(
  accessToken: string,
  clientId: string,
  search: string | undefined,
) {
  return usePagedInbox<TrackEmailMessage>(
    [SENT_EMAILS_QUERY_KEY, clientId, search ?? ""],
    (before) =>
      getInboundEmailReplies(accessToken, clientId, {
        search,
        direction: "OUT",
        before,
        limit: INBOX_PAGE_SIZE,
      }),
    { enabled: !!accessToken && !!clientId, poll: false },
  );
}

export function useInboundEmailReply(
  accessToken: string,
  clientId: string,
  id: string | undefined,
) {
  return useQuery<TrackEmailMessage>({
    queryKey: [INBOUND_EMAIL_REPLIES_QUERY_KEY, clientId, "detail", id],
    queryFn: () => getInboundEmailReply(accessToken, clientId, id as string),
    enabled: !!accessToken && !!clientId && !!id,
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
      type Row = { id: string; resolved_at?: string | null };
      const patch = (row: Row) =>
        row.id === id ? { ...row, resolved_at: nextResolvedAt } : row;
      // Cachés con tres formas: lista, páginas (useInfiniteQuery) y detalle.
      queryClient.setQueriesData<Row[] | { pages: Row[][] } | Row>(
        { queryKey: [key, clientId] },
        (old) => {
          if (!old) return old;
          if (Array.isArray(old)) return old.map(patch);
          if ("pages" in old)
            return { ...old, pages: old.pages.map((page) => page.map(patch)) };
          return patch(old);
        },
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

export const INBOX_PAGE_SIZE = 100;

export function useInboundInvoiceEmails(
  accessToken: string,
  clientId: string,
  { search, pending }: { search?: string; pending?: boolean } = {},
) {
  return usePagedInbox<InboundInvoiceEmail>(
    [
      INBOUND_INVOICE_EMAILS_QUERY_KEY,
      clientId,
      pending ? "pending" : "all",
      search ?? "",
    ],
    (before) =>
      getInboundInvoiceEmails(accessToken, clientId, {
        search,
        pending,
        before,
        limit: INBOX_PAGE_SIZE,
      }),
    { enabled: !!accessToken && !!clientId, poll: true },
  );
}

// Paginado por cursor: la primera página se refresca cada 30 s (si `poll`); las
// anteriores se bajan con `fetchNextPage` y se releen al invalidar.
function usePagedInbox<T extends { cursor?: string }>(
  key: string[],
  fetchPage: (before?: string) => Promise<T[]>,
  { enabled, poll }: { enabled: boolean; poll: boolean },
) {
  const head = useQuery<T[]>({
    queryKey: [...key, "head"],
    queryFn: () => fetchPage(),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: poll ? 30000 : false,
    refetchIntervalInBackground: false,
  });
  const older = useInfiniteQuery({
    queryKey: [...key, "pages"],
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: T[]) =>
      last.length === INBOX_PAGE_SIZE
        ? last[last.length - 1].cursor
        : undefined,
    enabled,
    placeholderData: keepPreviousData,
  });

  const { emails, hasGap } = useMemo(
    () => mergeInboxPages(head.data, older.data?.pages ?? [], INBOX_PAGE_SIZE),
    [head.data, older.data],
  );
  const { refetch } = older;
  useEffect(() => {
    if (hasGap) refetch();
  }, [hasGap, refetch]);

  return {
    data: emails,
    isLoading: head.isLoading,
    hasNextPage:
      (head.data?.length ?? 0) === INBOX_PAGE_SIZE && older.hasNextPage,
    fetchNextPage: older.fetchNextPage,
    isFetchingNextPage: older.isFetchingNextPage,
  };
}

export function useInboundInvoiceEmail(
  accessToken: string,
  clientId: string,
  id: string | undefined,
) {
  return useQuery<InboundInvoiceEmail>({
    queryKey: [INBOUND_INVOICE_EMAILS_QUERY_KEY, clientId, "detail", id],
    queryFn: () => getInboundInvoiceEmail(accessToken, clientId, id as string),
    enabled: !!accessToken && !!clientId && !!id,
  });
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
    mutationFn: ({ id, debtorId }: { id: string; debtorId: string }) =>
      linkInboundInvoiceEmail(accessToken, clientId, id, { debtorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INBOUND_INVOICE_EMAILS_QUERY_KEY, clientId],
      });
    },
  });
}
