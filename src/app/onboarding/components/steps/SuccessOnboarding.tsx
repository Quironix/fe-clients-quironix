"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import Stepper from "@/components/Stepper";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
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
    <StepLayout title="Confirmación de firma de contrato" description="">
      <section className="h-full">
        <div className="h-1/6 ">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
        </div>
        <div className="h-5/6 ">
          <div className="space-y-4">
            <div className="flex justify-center items-center border border-gray-300 rounded-lg px-5 py-5">
              <Image
                src="/img/success.svg"
                alt="Contract icon"
                width={100}
                height={100}
                className="w-1/2 h-auto"
              />
            </div>

            <div className="flex flex-col items-center space-x-2">
              <h3 className="text-lg font-bold">
                ¡Felicitaciones, has firmado el contrato!
              </h3>
              <p className="text-sm text-gray-500">
                Para revisarlo, puedes revisar la copia adjunta que se ha
                enviado a tu email.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Ahora estás listo para ingresar a la plataforma.
              </p>

              <Button
                className="mt-3"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                Ingresar a la plataforma
              </Button>
            </div>
          </div>
        </div>
      </section>
    </StepLayout>
  );
};

export default SuccessOnboarding;
