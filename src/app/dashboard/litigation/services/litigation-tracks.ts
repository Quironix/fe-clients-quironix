import * as z from "zod";
import { getLitigationById } from ".";
import { buildContactLabel } from "../../components/debtor-contact-select-form-item";
import { ManagementFormData } from "../../debtor-management/components/tabs/add-management-tab";
import { getManagementCombination } from "../../debtor-management/config/management-types";
import { buildEmailPayload } from "../../debtor-management/services/email-builder";
import { sendTrackEmail } from "../../debtor-management/services/email-sender";
import { createTrack } from "../../debtor-management/services/tracks";
import {
  CreateTrackPayload,
  TrackContact,
} from "../../debtor-management/types/track";
import { toDateOnlyString } from "../../debtor-management/utils/next-management-date";
import { Invoice } from "../../payment-plans/store";
import { LitigationItem } from "../types";

export type LitigationTrackKind = "ENTRY" | "NORMALIZATION";

export type LitigationEmailStatus = "SENT" | "FAILED" | "NO_EMAIL" | "SKIPPED";

type EmailProfile = Parameters<typeof buildEmailPayload>[0]["profile"];

interface DebtorContact {
  name?: string;
  email?: string;
  phone?: string;
}

interface Credentials {
  accessToken: string;
  clientId: string;
  profile: EmailProfile;
}

export interface LitigationManagement {
  kind: LitigationTrackKind;
  debtorId: string;
  invoiceIds: string[];
  litigationIds: string[];
  observation?: string;
  contacts?: DebtorContact[];
  selectedContact: string;
  nextManagementDate: Date;
  nextManagementTime: string;
  sendEmail: boolean;
}

const TRACK_COMMENTS: Record<
  LitigationTrackKind,
  Pick<CreateTrackPayload, "debtor_comment" | "executive_comment">
> = {
  ENTRY: {
    debtor_comment: "INVOICE_WITH_LITIGATION",
    executive_comment: "DOCUMENT_IN_LITIGATION",
  },
  NORMALIZATION: {
    debtor_comment: "INVOICE_REGISTERED_IN_ACCOUNTING",
    executive_comment: "ACCOUNTED",
  },
};

export const managementShape = {
  nextManagementDate: z.custom<Date>(
    (value) => value instanceof Date,
    "La fecha de próxima gestión es requerida"
  ),
  nextManagementTime: z
    .string()
    .min(1, "La hora de próxima gestión es requerida"),
  sendEmail: z.boolean(),
};

export const managementDefaults: {
  nextManagementDate?: Date;
  nextManagementTime: string;
  sendEmail: boolean;
} = {
  nextManagementDate: undefined,
  nextManagementTime: "",
  sendEmail: true,
};

const resolveContact = (
  contacts: DebtorContact[] = [],
  selected: string
): { name: string; track: TrackContact } => {
  const contact = contacts.find(
    (item) => buildContactLabel(item) === selected || item.name === selected
  );
  const name = contact?.name || selected;

  if (contact?.email) {
    return { name, track: { type: "EMAIL", value: contact.email } };
  }
  return { name, track: { type: "PHONE", value: contact?.phone || selected } };
};

const fetchLitigations = async (
  { accessToken, clientId }: Credentials,
  litigationIds: string[]
): Promise<LitigationItem[]> => {
  const results = await Promise.all(
    litigationIds.map((id) => getLitigationById(accessToken, clientId, id))
  );

  return results
    .filter((result) => result.success && result.data)
    .map((result) => result.data);
};

const toEmailInvoices = (litigations: LitigationItem[]): Invoice[] => {
  const invoicesById = new Map(
    litigations.map(({ invoice_id, invoice, debtor }) => [
      invoice_id,
      { ...invoice, debtor: { dni_number: debtor?.dni?.dni } },
    ])
  );

  return [...invoicesById.values()] as unknown as Invoice[];
};

const sendLitigationEmail = async (
  credentials: Credentials,
  management: LitigationManagement,
  trackId: string,
  contact: { name: string; track: TrackContact }
): Promise<boolean> => {
  const comments = TRACK_COMMENTS[management.kind];
  const managementCombination = getManagementCombination(
    "",
    comments.debtor_comment,
    comments.executive_comment
  );
  const litigations = await fetchLitigations(
    credentials,
    management.litigationIds
  );

  if (!managementCombination || litigations.length === 0) return false;

  const emailPayload = buildEmailPayload({
    managementFormData: {
      debtorComment: comments.debtor_comment,
      executiveComment: comments.executive_comment,
      contactValue: contact.track.value,
      selectedContact: { name: contact.name },
      caseData: {},
    } as ManagementFormData,
    selectedInvoices: toEmailInvoices(litigations),
    profile: credentials.profile,
    managementCombination,
    trackId,
    debtorName: litigations[0].debtor?.name,
  });

  const { success } = await sendTrackEmail(
    emailPayload,
    credentials.accessToken,
    credentials.clientId
  );

  return success;
};

export const registerLitigationManagement = async (
  credentials: Credentials,
  management: LitigationManagement
): Promise<{ email: LitigationEmailStatus; recipient?: string }> => {
  const contact = resolveContact(
    management.contacts,
    management.selectedContact
  );
  const isEmailContact = contact.track.type === "EMAIL";

  const { track } = await createTrack(
    credentials.accessToken,
    credentials.clientId,
    {
      ...TRACK_COMMENTS[management.kind],
      debtor_id: management.debtorId,
      management_type: isEmailContact ? "MAIL_IN" : "CALL_IN",
      contact: contact.track,
      observation: management.observation ?? "",
      next_management_date: `${toDateOnlyString(management.nextManagementDate)}T${management.nextManagementTime}:00.000Z`,
      invoice_ids: [...new Set(management.invoiceIds)],
      ...(management.kind === "ENTRY" && {
        case_data: { litigationIds: management.litigationIds },
      }),
    }
  );

  if (!management.sendEmail) return { email: "SKIPPED" };
  if (!isEmailContact) return { email: "NO_EMAIL" };

  const recipient = contact.track.value;
  const sent = await sendLitigationEmail(
    credentials,
    management,
    track.id,
    contact
  ).catch(() => false);

  return { email: sent ? "SENT" : "FAILED", recipient };
};
