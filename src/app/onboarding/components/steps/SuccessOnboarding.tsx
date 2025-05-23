"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import Stepper from "@/components/Stepper";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { File, FileText } from "lucide-react";
const SuccessOnboarding: React.FC<OnboardingStepProps> = ({
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
      title="Términos y condiciones"
      description="Estos son los términos y condiciones. Léelos detenidamente antes de continuar."
    >
      {/* Stepper */}
      <div className="mb-8">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
        />
      </div>

      <div className="space-y-8  min-h-[530px] max-h-[530px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-center items-center border border-gray-300 rounded-lg px-5 py-5">
            <Image
              src="/img/success.svg"
              alt="Contract icon"
              width={100}
              height={100}
              className="w-52 h-auto"
            />
          </div>

          <div className="flex flex-col items-center space-x-2">
            <h3 className="text-lg font-bold">
              ¡Felicitaciones, has firmado el contrato!
            </h3>
            <p className="text-sm text-gray-500">
              Para revisarlo, puedes revisar la copia adjunta que se ha enviado
              a tu email.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Ahora estás listo para ingresar a la plataforma.
            </p>

            <Button className="mt-3">Ingresar a la plataforma</Button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default SuccessOnboarding;
