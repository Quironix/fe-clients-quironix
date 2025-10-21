"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import Stepper from "@/components/Stepper";
import { Step } from "@/components/Stepper/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useState } from "react";
import { SavedManagementCard } from "./saved-management-card";
import { StepOne, StepThree, StepTwo } from "./steps";

interface AddManagementTabProps {
  dataDebtor: any;
  session?: any;
  profile?: any;
}

// Definir los 3 pasos del stepper
const steps: Step[] = [
  { id: 1, label: "Paso 1", completed: false },
  { id: 2, label: "Paso 2", completed: false },
  { id: 3, label: "Paso 3", completed: false },
];

import { ContactType } from "../../config/management-types";
import { CaseData } from "../../types/track";

// Tipo para los datos del formulario de gestión
export interface ManagementFormData {
  // Selección en cascada (3 niveles)
  managementType: string; // Primer nivel
  debtorComment: string; // Segundo nivel
  executiveComment: string; // Tercer nivel

  // Datos de contacto
  contactType: ContactType | "";
  contactValue: string;

  // Observación
  observation: string;

  // Próxima gestión
  nextManagementDate: string;
  nextManagementTime: string;

  // Datos dinámicos del caso (se llenan según el tipo de gestión)
  caseData: CaseData;

  // Campos del Step 3
  file?: File | null;
  comment?: string;
  sendEmail?: boolean;
}

// Tipo para una gestión guardada completa
export interface SavedManagement {
  id: string;
  formData: ManagementFormData;
  selectedInvoices: Invoice[];
  createdAt: Date;
}

export const AddManagementTab = ({
  dataDebtor,
  session,
  profile,
}: AddManagementTabProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsState, setStepsState] = useState<Step[]>(steps);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [savedManagements, setSavedManagements] = useState<SavedManagement[]>(
    []
  );
  const [managementFormData, setManagementFormData] =
    useState<ManagementFormData>({
      managementType: "",
      debtorComment: "",
      executiveComment: "",
      contactType: "",
      contactValue: "",
      observation: "",
      nextManagementDate: "",
      nextManagementTime: "",
      caseData: {},
      file: null,
      comment: "",
      sendEmail: false,
    });

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

  // Función para manejar la selección de facturas
  const handleInvoicesSelected = (invoices: Invoice[]) => {
    setSelectedInvoices(invoices);
    console.log("Facturas seleccionadas:", invoices);
  };

  // Función para manejar cambios en el formulario de gestión
  const handleManagementFormChange = (data: Partial<ManagementFormData>) => {
    setManagementFormData((prev) => ({ ...prev, ...data }));
    console.log("Datos de gestión:", { ...managementFormData, ...data });
  };

  // Función para resetear el formulario de gestión (Step 2 y 3)
  const resetManagementForm = () => {
    setManagementFormData({
      managementType: "",
      debtorComment: "",
      executiveComment: "",
      contactType: "",
      contactValue: "",
      observation: "",
      nextManagementDate: "",
      nextManagementTime: "",
      caseData: {},
      file: null,
      comment: "",
      sendEmail: false,
    });
    // Mantener las facturas seleccionadas del Step 1
    // No reseteamos selectedInvoices
  };

  // Función para agregar gestión y continuar editando
  const handleAddManagement = async () => {
    setIsSubmitting(true);
    try {
      // Crear nueva gestión guardada
      const newManagement: SavedManagement = {
        id: `management-${Date.now()}`,
        formData: { ...managementFormData },
        selectedInvoices: [...selectedInvoices],
        createdAt: new Date(),
      };

      // Agregar a la lista de gestiones guardadas
      setSavedManagements((prev) => [...prev, newManagement]);

      console.log("Gestión agregada:", newManagement);

      // Resetear formulario para agregar otra gestión
      resetManagementForm();

      // Volver al Step 2 para agregar nueva gestión
      setCurrentStep(1);

      // Resetear estados de los steps
      setStepsState(steps.map((step) => ({ ...step, completed: false })));
    } catch (error) {
      console.error("Error al agregar gestión:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para eliminar una gestión guardada
  const handleDeleteManagement = (id: string) => {
    setSavedManagements((prev) => prev.filter((m) => m.id !== id));
  };

  // Función para finalizar el proceso completamente
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const { createMultipleTracks } = await import("../../services/tracks");
      const { toast } = await import("sonner");

      // Validar datos requeridos
      if (!session?.token || !profile?.client_id || !dataDebtor?.id) {
        throw new Error("Faltan datos de sesión o perfil");
      }

      // Validar que la gestión actual esté completa
      if (
        !managementFormData.managementType ||
        !managementFormData.debtorComment ||
        !managementFormData.executiveComment
      ) {
        throw new Error("Debe completar la selección de gestión");
      }

      // Agregar la gestión actual a las guardadas
      const allManagements = [
        ...savedManagements,
        {
          id: `management-${Date.now()}`,
          formData: { ...managementFormData },
          selectedInvoices: [...selectedInvoices],
          createdAt: new Date(),
        },
      ];

      // Convertir todas las gestiones guardadas a payloads
      const payloads = allManagements.map((management) => {
        // Combinar fecha y hora para next_management_date
        const nextManagementDateTime = management.formData.nextManagementDate
          ? `${management.formData.nextManagementDate}T${management.formData.nextManagementTime || "00:00"}:00.000Z`
          : new Date().toISOString();

        return {
          debtor_id: dataDebtor.id,
          management_type: management.formData.managementType,
          contact: {
            type: management.formData.contactType as any,
            value: management.formData.contactValue,
          },
          observation: management.formData.observation,
          debtor_comment: management.formData.debtorComment,
          executive_comment: management.formData.executiveComment,
          next_management_date: nextManagementDateTime,
          case_data: management.formData.caseData,
          invoice_ids: management.selectedInvoices.map((inv) => inv.id),
        };
      });

      // Invocar el endpoint para cada gestión
      const results = await createMultipleTracks(
        session.token,
        profile.client_id,
        payloads
      );

      console.log("Gestiones creadas exitosamente:", results);
      toast.success(
        `Se crearon ${results.length} gestión(es) exitosamente`
      );

      // Limpiar todo
      setSavedManagements([]);
      resetManagementForm();
      setSelectedInvoices([]);
      setCurrentStep(0);
      setStepsState(steps.map((step) => ({ ...step, completed: false })));
    } catch (error) {
      console.error("Error al finalizar:", error);
      const { toast } = await import("sonner");
      toast.error(
        error instanceof Error ? error.message : "Error al crear gestiones"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar el contenido de cada paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepOne
            dataDebtor={dataDebtor}
            onInvoicesSelected={handleInvoicesSelected}
          />
        );
      case 1:
        return (
          <StepTwo
            dataDebtor={dataDebtor}
            formData={managementFormData}
            onFormChange={handleManagementFormChange}
          />
        );
      case 2:
        return (
          <StepThree
            dataDebtor={dataDebtor}
            formData={managementFormData}
            onFormChange={handleManagementFormChange}
            selectedInvoices={selectedInvoices}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-md h-full border border-gray-300 mt-5">
      {/* Gestiones guardadas */}
      {savedManagements.length > 0 && (
        <div className="mb-4 space-y-2">
          {savedManagements.map((management, index) => (
            <SavedManagementCard
              key={management.id}
              management={management}
              index={index}
              onDelete={handleDeleteManagement}
            />
          ))}
        </div>
      )}

      {/* Stepper actual */}
      <div className="mb-6 border-gray-300">
        <Stepper
          steps={stepsState}
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />
        {savedManagements.length > 0 && (
          <h3 className="text-base font-semibold text-blue-600 mb-4">
            Gestión {savedManagements.length + 1}
          </h3>
        )}
      </div>

      {/* Contenido del paso actual */}
      <div className="border border-gray-200 rounded-md p-5 min-h-[500px] flex flex-col">
        <div className="flex-1">{renderStepContent()}</div>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center gap-6 border-t border-primary pt-3 mt-6">
          {/* Botón Volver - siempre a la izquierda */}
          <div>
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
          </div>

          {/* Botones de acción - siempre a la derecha */}
          <div className="flex gap-4">
            {currentStep === steps.length - 1 ? (
              // Botones del último paso
              <>
                <Button
                  variant="outline"
                  className="h-11 rounded-sm border-2 border-orange-400 text-orange-600 hover:bg-orange-50"
                  onClick={handleAddManagement}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Agregar gestión
                </Button>
                <Button
                  className="h-11 rounded-sm bg-primary hover:bg-primary/90"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white mr-2" />
                      Finalizar gestión
                    </>
                  )}
                </Button>
              </>
            ) : (
              // Botón continuar para otros pasos
              <Button
                className="w-45 h-11 rounded-sm"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Continuar <ArrowRight className="w-4 h-4 text-white ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
