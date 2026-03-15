import { Step } from "@/components/Stepper/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Loader from "../../components/loader";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("debtors.navigation");
  return (
    <div className="flex justify-end gap-6 border-t border-primary pt-3 w-full">
      {currentStep >= 1 && (
        <Button
          variant="outline"
          className="w-45 h-11 rounded-sm border-2 border-primary"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 text-primary" /> {t("back")}
        </Button>
      )}
      <Button
        className="w-45 h-11 rounded-sm"
        type="submit"
        disabled={loading}
        onClick={onNext}
      >
        {loading ? (
          <Loader text={t("saving")} />
        ) : (
          <>
            {steps && currentStep === steps.length - 1 ? (
              <>
                <Save className="w-4 h-4 text-white" /> {t("finish")}
              </>
            ) : (
              <>
                {t("continue")} <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
};
