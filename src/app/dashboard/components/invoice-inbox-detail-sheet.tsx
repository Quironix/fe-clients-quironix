"use client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import { useTranslations } from "next-intl";
import { InvoiceInboxDetail } from "./invoice-inbox-detail";

interface InvoiceInboxDetailSheetProps {
  email: InboundInvoiceEmail | null;
  cobranza: TrackEmailMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceInboxDetailSheet = ({
  email,
  cobranza,
  open,
  onOpenChange,
}: InvoiceInboxDetailSheetProps) => {
  const t = useTranslations("dashboard.invoice_inbox");

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        aria-describedby={undefined}
        className="w-full overflow-y-auto pt-10 sm:max-w-xl"
      >
        <SheetTitle className="sr-only">
          {email?.subject || cobranza?.subject || t("no_subject")}
        </SheetTitle>
        <InvoiceInboxDetail
          email={email}
          cobranza={cobranza}
          onAction={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
