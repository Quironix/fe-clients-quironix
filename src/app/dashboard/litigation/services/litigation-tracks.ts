import * as z from "zod";
import { buildContactLabel } from "../../components/debtor-contact-select-form-item";
import { queueTrackSummaryEmail } from "../../debtor-management/services/email-sender";
import { createTrack } from "../../debtor-management/services/tracks";
import {
  CreateTrackPayload,
  TrackContact,
} from "../../debtor-management/types/track";
import { toDateOnlyString } from "../../debtor-management/utils/next-management-date";

export type LitigationTrackKind = "ENTRY" | "NORMALIZATION";

export type LitigationEmailStatus =
  | "QUEUED"
  | "FAILED"
  | "NO_EMAIL"
  | "SKIPPED";

interface DebtorContact {
  name?: string;
  email?: string;
  phone?: string;
}

interface Credentials {
  accessToken: string;
  clientId: string;
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
    return { name, track: { type: "EMAIL", value: contact.email, name } };
  }
  return { name, track: { type: "PHONE", value: contact?.phone || selected } };
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
  const { success } = await queueTrackSummaryEmail(
    [track.id],
    credentials.accessToken,
    credentials.clientId
  );

  return { email: success ? "QUEUED" : "FAILED", recipient };
};
