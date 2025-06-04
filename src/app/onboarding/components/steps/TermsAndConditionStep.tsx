"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import Stepper from "@/components/Stepper";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, File, FileText } from "lucide-react";

const TermsAndConditionStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleOpenTerms = () => {
    if (profile?.client?.terms_and_conditions) {
      window.open(profile.client.terms_and_conditions, "_blank");
      setHasReadTerms(true);
    }
  };

  const handleTermsAcceptance = (checked: boolean) => {
    setTermsAccepted(checked);
  };

  return (
    <StepLayout
      title="Términos y condiciones"
      description="Estos son los términos y condiciones. Léelos detenidamente antes de continuar."
    >
      <section className="h-full">
        <div className="h-1/6">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
        </div>
        <div className="h-4/6 ">
          <div className="h-full">
            <div className="flex justify-between items-center border border-gray-300 rounded-lg h-[90%]">
              <div className="w-1/2 h-ful">
                <Image
                  src="/img/terms-and-condition.svg"
                  alt="Terms and condition icon"
                  width={100}
                  height={100}
                  className="w-full h-full"
                />
              </div>
              <div className="w-1/2 h-full flex justify-center items-center text-center">
                <Button
                  variant="outline"
                  className="border-2 border-orange-300 text-gray-500 bg-white"
                  onClick={handleOpenTerms}
                >
                  <FileText className="w-4 h-4 mr-2 text-orange-300" /> Leer
                  términos y condiciones
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center mt-3 space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={handleTermsAcceptance}
                disabled={!hasReadTerms}
              />
              <label
                htmlFor="terms"
                className={`text-sm font-medium leading-none ${
                  !hasReadTerms ? "text-gray-400" : ""
                }`}
              >
                Acepto los términos y condiciones
              </label>
            </div>
          </div>
        </div>
        <div className="h-1/6 flex justify-between items-center">
          {!isFirstStep && (
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="px-6 py-2"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Volver
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            className="px-6 py-2"
            disabled={!termsAccepted}
          >
            Continuar <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </StepLayout>
  );
};

export default TermsAndConditionStep;
