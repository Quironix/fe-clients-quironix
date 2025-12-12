import { getDocumentTypeDisplayData } from "@/app/dashboard/payment-netting/components/document-type-badge";
import { formatNumber } from "@/lib/utils";
import { FileText } from "lucide-react";

const LitigationsCard = ({ data }: { data: any }) => {
  const litigations = data?.litigations;

  if (!litigations) {
    return (
      <div className="flex flex-col justify-center items-center gap-3">
        <span className="text-sm text-muted-foreground">
          No hay datos de litigios disponibles
        </span>
      </div>
    );
  }

  const totalDebt = litigations.total_debt_in_litigation || 0;
  const byType = litigations.by_type || {};

  // Filtrar solo los tipos que tengan monto mayor a 0
  const documentTypes = Object.entries(byType).filter(
    ([_, value]: [string, any]) => value.amount > 0
  );

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="flex flex-col items-center">
        <span>Deuda en litigios</span>
        <span className="font-bold">{formatNumber(totalDebt)}</span>
      </div>

      {documentTypes.length > 0 ? (
        documentTypes.map(([type, value]: [string, any]) => {
          const { text } = getDocumentTypeDisplayData(type);
          return (
            <div key={type} className="flex justify-between w-full px-5">
              <div className="flex gap-1 items-center text-sm">
                <FileText color="gray" size={16} />
                <span>{text}</span>
              </div>
              <div className="text-sm">
                {formatNumber(value.amount)}
                {value.count > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({value.count})
                  </span>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <span className="text-sm text-muted-foreground">
          No hay documentos en litigio
        </span>
      )}
    </div>
  );
};

export default LitigationsCard;
