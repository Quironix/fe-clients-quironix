"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import Stepper from "@/components/Stepper";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react";

const TwoFactorStep: React.FC<OnboardingStepProps> = ({
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
      title="Autentificación de dos factores"
      description="Por tu seguridad, es necesario completar la autenticación en dos pasos."
    >
      <section className="h-full">
        <div className="h-1/6 ">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
        </div>
        <div className="h-4/6">
          <div className="space-y-8 min-h-2/3 max-h-2/3">
            <div>
              <p className="mb-8">
                Ingresa el código que ha sido enviado{" "}
                <span className="font-bold">a tu email:</span>
              </p>
              <div className="flex justify-center flex-col items-center border border-gray-300 rounded-lg px-4 py-8">
                <InputOTP maxLength={6} className="gap-3 justify-center">
                  <InputOTPGroup className="gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="rounded-lg border-2 w-12 h-12"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 inline-flex items-center gap-2">
                    ¿No has recibido el código?{" "}
                    <button
                      onClick={handleResendCode}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Reenviar código
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="">
                Al continuar,{" "}
                <span className="font-bold">estás aceptando lo siguiente:</span>
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircleIcon className="w-5 h-5 text-orange-500" />
                  Que creemos una cuenta para ti (a menos que ya esté creada)
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircleIcon className="w-5 h-5 text-orange-500" />
                  Nuestros "Términos y condiciones"
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircleIcon className="w-5 h-5 text-orange-500" />
                  Nuestras "Políticas de privacidad"
                </li>
              </ul>
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
          <Button type="button" onClick={onNext} className="px-6 py-2">
            Continuar <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </StepLayout>
  );
};

export default TwoFactorStep;
