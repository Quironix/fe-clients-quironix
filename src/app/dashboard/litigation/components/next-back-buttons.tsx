import { Step } from "@/components/Stepper/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Loader from "../../components/loader";

interface NextBackButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  loading?: boolean;
  currentStep: number;
  steps?: Step[];
}

export const NextBackButtons = ({
  onBack,
  onNext,
  loading,
  currentStep,
  steps,
}: NextBackButtonsProps) => {
  return (
    <div className="flex justify-end gap-6 border-t border-primary pt-3 w-full">
      {currentStep >= 1 && (
        <Button
          variant="outline"
          className="w-45 h-11 rounded-sm border-2 border-primary"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 text-primary" /> Volver
        </Button>
      )}
      <Button
        className="w-45 h-11 rounded-sm"
        type="submit"
        disabled={loading}
        onClick={onNext}
      >
        {loading ? (
          <Loader text="Guardando..." />
        ) : (
          <>
            {steps && currentStep === steps.length - 1 ? (
              <>
                <Save className="w-4 h-4 text-white" /> Finalizar
              </>
            ) : (
              <>
                Continuar <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
};
