import { Circle, TriangleAlert } from "lucide-react";
import { CallReasons } from "../types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../../components/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CreditRisk = ({ data }: { data: CallReasons }) => {
  return (
    <div className="flex flex-col justify-center items-center w-full gap-3 flex-1 py-2">
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Crédito actual</span>
        <span className="text-xs font-bold">$3.250.000</span>
      </div>
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Crédito disponible</span>
        <span className="text-xs font-bold">$250.000</span>
      </div>
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Cat. de riesgo</span>
        <span className="text-xs font-bold flex items-center gap-1">
          <Circle color="red" fill="red" size={15} /> Alto
        </span>
      </div>

      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Estado crediticio</span>
        <Badge variant="error" text="Retenido" />
      </div>
    </div>
  );
};

export default CreditRisk;
