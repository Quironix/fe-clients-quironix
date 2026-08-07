import { format } from "date-fns";
import {
  Building,
  Calendar,
  FileText,
  FolderTree,
  MessageSquare,
  SquareUserRound,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { disputes } from "../../../data";
import { LitigationItem } from "../../types";

interface LitigationDetailProps {
  litigation: LitigationItem;
}

const getMotivoLabel = (code: string) => {
  const dispute = disputes.find((d) => d.code === code);
  return dispute ? dispute.label : code || "-";
};

const getSubmotivoLabel = (motivoCode: string, submotivoCode: string) => {
  const dispute = disputes.find((d) => d.code === motivoCode);
  if (dispute) {
    const submotivo = dispute.submotivo.find((s) => s.code === submotivoCode);
    return submotivo ? submotivo.label : submotivoCode || "-";
  }
  return submotivoCode || "-";
};

const LitigationDetail = ({ litigation }: LitigationDetailProps) => {
  const t = useTranslations("litigation");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 bg-[#EDF2F7] px-4 py-3 my-2 rounded-md">
        <div className="flex items-center">
          <div>
            <p className="text-gray-600">{t("detail.invoiceAmount")}</p>
            <p className="text-[#2F6EFF] font-bold text-md">
              $
              {new Intl.NumberFormat("es-CL").format(
                Number(litigation?.invoice.amount) || 0
              )}
            </p>
          </div>
        </div>

        <div>
          <p className="text-gray-600">{t("detail.litigationAmount")}</p>
          <p className="text-[#2F6EFF] font-bold text-md">
            $
            {new Intl.NumberFormat("es-CL").format(
              litigation?.litigation_amount ?? 0
            )}
          </p>
        </div>
      </div>

      <div className=" bg-[#CBD5E1] h-0.5 max-w-full my-4"></div>

      <div className="grid grid-cols-2 gap-6 text-sm text-gray-800">
        <div className="flex items-center gap-2">
          <SquareUserRound />
          <div>
            <p className="text-sm font-semibold">RUT</p>
            <p className="text-md">
              {litigation?.debtor.dni.dni ?? "Desconocido"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Building />
          <div>
            <p className="text-sm font-semibold">{t("detail.businessName")}</p>
            <p className="text-md">
              {litigation?.debtor.name ?? "Razon social"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FileText />
          <div>
            <p className="text-sm font-semibold">{t("detail.reason")}</p>
            <p className="text-md">
              {getMotivoLabel(litigation?.motivo || "")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FolderTree />
          <div>
            <p className="text-sm font-semibold">{t("detail.subreason")}</p>
            <p className="text-md">
              {getSubmotivoLabel(
                litigation?.motivo || "",
                litigation?.submotivo || ""
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar />
          <div>
            <p className="text-sm font-semibold">{t("detail.date")}</p>
            <p className="text-md">
              <span className="font-semibold">
                {format(litigation?.created_at, "dd/MM/yyyy HH:mm") || "-"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User />
          <div>
            <p className="text-sm font-semibold">{t("detail.contact")}</p>
            <p className="text-md">{litigation?.contact ?? "Contacto"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-2 border-[#EDF2F7] rounded-md p-4 text-sm my-4">
        <MessageSquare className="w-6 h-6 text-gray-500" />
        <div className="flex flex-col gap-1">
          <span className="font-light text-sm">{t("detail.comment")}</span>
          <div className="flex flex-col gap-2">
            {litigation?.comments && litigation.comments.length > 0 ? (
              litigation.comments.map((comment, idx) => (
                <div key={idx} className=" text-gray-500">
                  <span className="block text-sm">- {comment.content}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic">{t("detail.noComments")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitigationDetail;
