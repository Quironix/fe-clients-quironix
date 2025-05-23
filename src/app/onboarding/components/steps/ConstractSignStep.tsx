"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import Stepper from "@/components/Stepper";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, File, FileText } from "lucide-react";
const ContractSignStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
}) => {
  const handleResendCode = () => {
    // Aquí iría la lógica para reenviar el código
    console.log("Reenviando código...");
  };

  return (
    <StepLayout
      title="Firma tu contrato"
      description="Este es el contrato para comenzar a usar la plataforma. Por favor, léelo con calma y fírmalo para continuar."
    >
      <section className="h-full">
        <div className="h-1/6 ">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
        </div>
        <div className="h-4/6  ">
          <div className="h-full">
            <div className="flex justify-between items-center border border-gray-300 rounded-lg h-[90%]">
              <div className="w-1/2 h-full ">
                <Image
                  src="/img/contract-icon.svg"
                  alt="Terms and condition icon"
                  width={100}
                  height={100}
                  className="w-full h-full"
                />
              </div>
              <div className="w-1/2 h-full flex justify-center items-center  text-center">
                <Button
                  variant="outline"
                  className="border-2 border-orange-300 text-gray-500 bg-white"
                >
                  <FileText className="w-4 h-4 mr-2 text-orange-300" /> Leer
                  contrato
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 mt-3">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Firmar contrato
              </label>
            </div>
          </div>
        </div>
        <div className="h-1/6 flex justify-between items-center ">
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
          <Button type="button" onClick={onNext} className="px-6 py-2">
            Continuar <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </StepLayout>
  );
};

export default ContractSignStep;
