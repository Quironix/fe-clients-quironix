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
import { disputes } from "../../../data";
import { LitigationItem } from "../../types";

type LitigationDetailProps = {
  litigation: LitigationItem;
};

// Funciones helper para mapear códigos a etiquetas
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 bg-[#EDF2F7] px-4 py-3 my-2 rounded-md">
        <div className="flex items-center">
          <div>
            <p className="text-gray-600">Monto Factura</p>
            <p className="text-[#2F6EFF] font-bold text-md">
              $
              {new Intl.NumberFormat("es-CL").format(
                Number(litigation?.invoice.amount) || 0
              )}
            </p>
          </div>
        </div>

        <div>
          <p className="text-gray-600">Monto litigio</p>
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
            <p className="text-sm font-semibold">Razón social</p>
            <p className="text-md">
              {litigation?.debtor.name ?? "Razon social"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FileText />
          <div>
            <p className="text-sm font-semibold">Motivo</p>
            <p className="text-md">
              {getMotivoLabel(litigation?.motivo || "")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FolderTree />
          <div>
            <p className="text-sm font-semibold">Submotivo</p>
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
            <p className="text-sm font-semibold">Fecha</p>
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
            <p className="text-sm font-semibold">Contacto</p>
            <p className="text-md">{litigation?.contact ?? "Contacto"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-2 border-[#EDF2F7] rounded-md p-4 text-sm my-4">
        <MessageSquare className="w-6 h-6 text-gray-500" />
        <div className="flex flex-col gap-1">
          <span className="font-light text-sm">Comentario</span>
          <div className="flex flex-col gap-2">
            {litigation?.comments && litigation.comments.length > 0 ? (
              litigation.comments.map((comment, idx) => (
                <div key={idx} className=" text-gray-500">
                  <span className="block text-sm">- {comment.content}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic">Sin comentarios</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitigationDetail;
