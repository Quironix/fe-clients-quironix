import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

interface DebtorEmailReply {
  id: string;
  from_address: string;
  subject: string;
  body_text?: string | null;
  body_html?: string | null;
  created_at: string;
}

interface EmailThreadTabProps {
  emailReplies: DebtorEmailReply[];
  isFetchingEmailReplies: boolean;
}

export const EmailThreadTab = ({
  emailReplies,
  isFetchingEmailReplies,
}: EmailThreadTabProps) => {
  const t = useTranslations("debtorManagement.emailThreadTab");

  if (isFetchingEmailReplies) {
    return (
      <div className="flex flex-col gap-3 mt-5">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-lg border p-4">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!emailReplies || emailReplies.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md h-full flex items-center justify-center mt-5">
        <span className="text-gray-500">{t("empty")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-5">
      {emailReplies.map((reply) => (
        <div
          key={reply.id}
          className="bg-white rounded-lg border p-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">
                {reply.subject || t("noSubject")}
              </span>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDateTime(reply.created_at)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {t("from")}: {reply.from_address}
          </span>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {reply.body_text || ""}
          </p>
        </div>
      ))}
    </div>
  );
};
