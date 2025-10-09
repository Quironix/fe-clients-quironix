import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gavel,
  Search,
} from "lucide-react";

export const TaskFilters = () => {
  return (
    <div className=" mb-3 flex items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar deudor"
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="secondary"
          className="bg-gray-400 hover:bg-gray-500 text-white"
        >
          Todas 24
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50  text-xs"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Riesgo 5
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50  text-xs"
        >
          <FileText className="w-4 h-4 mr-2" />
          Gen. Caja 2
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50  text-xs"
        >
          <Gavel className="w-4 h-4 mr-2" />
          Litigios 1
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completadas 16
        </Button>
      </div>
    </div>
  );
};
