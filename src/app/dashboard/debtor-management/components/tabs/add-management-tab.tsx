"use client";

import Stepper from "@/components/Stepper";
import { Step } from "@/components/Stepper/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useState } from "react";

interface AddManagementTabProps {
  dataDebtor: any;
}

// Definir los 3 pasos del stepper
const steps: Step[] = [
  { id: 1, label: "Paso 1", completed: false },
  { id: 2, label: "Paso 2", completed: false },
  { id: 3, label: "Paso 3", completed: false },
];

export const AddManagementTab = ({ dataDebtor }: AddManagementTabProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsState, setStepsState] = useState<Step[]>(steps);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...stepsState];
      newSteps[currentStep].completed = true;
      setStepsState(newSteps);
      setCurrentStep(currentStep + 1);
    } else {
      // Lógica para finalizar (último paso)
      handleFinish();
    }
  };

  // Función para retroceder al paso anterior
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para cambiar de paso directamente desde el stepper
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // Función para finalizar el proceso
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implementar lógica de finalización
      console.log("Finalizando proceso...");
    } catch (error) {
      console.error("Error al finalizar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar el contenido de cada paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contenido del Paso 1</h3>
            <p className="text-gray-600">
              Aquí va el contenido del primer paso...
            </p>
            {/* TODO: Agregar componentes del paso 1 */}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contenido del Paso 2</h3>
            <p className="text-gray-600">
              Aquí va el contenido del segundo paso...
            </p>
            {/* TODO: Agregar componentes del paso 2 */}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contenido del Paso 3</h3>
            <p className="text-gray-600">
              Aquí va el contenido del tercer paso...
            </p>
            {/* TODO: Agregar componentes del paso 3 */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-md h-full">
      {/* Stepper */}
      <div className="mb-6">
        <Stepper
          steps={stepsState}
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />
      </div>

      {/* Contenido del paso actual */}
      <div className="border border-gray-200 rounded-md p-5">
        {renderStepContent()}

        {/* Botones de navegación */}
        <div className="flex justify-end gap-6 border-t border-primary pt-3 mt-6">
          {currentStep > 0 && (
            <Button
              variant="outline"
              className="w-45 h-11 rounded-sm border-2 border-primary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 text-primary" /> Volver
            </Button>
          )}
          <Button
            className="w-45 h-11 rounded-sm"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Guardando..."
            ) : (
              <>
                {currentStep === steps.length - 1 ? (
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
      </div>
    </div>
  );
};
