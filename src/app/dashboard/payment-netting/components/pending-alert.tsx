import { Button } from "@/components/ui/button";
import { ArrowUpCircle, FileBadge } from "lucide-react";
import CommentAlert from "./comment-alert";

const PendingAlert = () => {
  return (
    <div className="border border-red-400 bg-red-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <ArrowUpCircle className="w-6 h-6" />
        <span className="text-lg font-bold">Diferencia: saldo pendiente</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="text-sm font-semibold">Cargos:</span>
          <span className="text-sm font-bold">
            <span className="text-black">$250.000</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="text-sm font-semibold">Abonos:</span>
          <span className="text-sm font-bold">
            <span className="text-black">-$150.000</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-5 border-t border-blue-400 pt-2">
          <span className="text-sm font-semibold">Diferencia:</span>
          <span className="text-sm font-bold">
            <span className="text-black">-$100.000</span>
          </span>
        </div>
        <CommentAlert
          comment={
            <span>
              APuede dejar el{" "}
              <span className="font-bold">
                saldo pendiente para futuras gestiones o marcarlo como litigio.
              </span>
            </span>
          }
          cta={
            <Button
              variant="outline"
              className="border-orange-400 flex items-center gap-2"
            >
              <FileBadge className="w-4 h-4 text-orange-400" /> Ingresar litigio
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default PendingAlert;
