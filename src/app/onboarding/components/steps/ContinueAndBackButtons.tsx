import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Loader } from "lucide-react";

export interface ContinueAndBackButtonsProps {
  isFirstStep: boolean;
  onBack: () => void;
  loading?: boolean;
  form?: any;
  blockContinue?: boolean;
  onContinue?: () => void;
}

export const ContinueAndBackButtons = ({
  isFirstStep,
  onBack,
  loading,
  form,
  blockContinue,
  onContinue,
}: ContinueAndBackButtonsProps) => {
  return (
    <>
      <div
        className={`flex items-center justify-end gap-4 p-5 border-t border-orange-500 pt-4`}
      >
        {!isFirstStep && (
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="px-6 py-2 border-2 border-primary h-10 w-40"
          >
            <ArrowLeftIcon className="w-4 h-4 text-primary" /> Volver
          </Button>
        )}
        <Button
          type="submit"
          className="px-6 py-2 border-2 border-primary h-10 w-40"
          disabled={loading || form?.formState?.isSubmitting || blockContinue}
          onClick={onContinue}
        >
          {loading || form?.formState?.isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" /> Cargando
            </div>
          ) : (
            <>
              Continuar <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );
};
