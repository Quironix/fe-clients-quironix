"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import Stepper from "@/components/Stepper";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
const PersonalInformationStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
}) => {
  return (
    <StepLayout
      title="Datos personales"
      description="Completa los campos obligatorios para acceder a tu cuenta."
    >
      <section className="h-full">
        {/* Botones de navegación */}
        <div className="h-1/6 ">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
        </div>
        <div className="h-4/6 ">
          <div className="h-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  País<span className="text-red-500">*</span>
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>Selecciona</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Razón social<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Completa"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Completa"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Apellido<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Completa"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Número de teléfono<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+56 9 1234 5678"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
        <div
          className={`h-1/6 flex items-center ${isFirstStep ? "justify-end" : "justify-between"}`}
        >
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

export default PersonalInformationStep;
