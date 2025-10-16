import { Edit, FileText } from "lucide-react";

const LitigationsCard = ({ data }: { data: any }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="flex flex-col items-center">
        <span>Deuda en litigios</span>
        <span className="font-bold">$480.000</span>
      </div>
      <div className="flex justify-between w-full px-5">
        <div className="flex gap-1 items-center text-sm">
          <FileText color="gray" /> <span>Factura comercial</span>
        </div>
        <div>FAC-123123</div>
      </div>
      <div className="flex justify-between w-full px-5">
        <div className="flex gap-1 items-center text-sm">
          <Edit color="gray" /> <span>Nota de crédito</span>
        </div>
        <div>$480.000 (propuesta)</div>
      </div>
    </div>
  );
};

export default LitigationsCard;
