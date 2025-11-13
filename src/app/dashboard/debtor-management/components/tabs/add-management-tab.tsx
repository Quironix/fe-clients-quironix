"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import Stepper from "@/components/Stepper";
import { Step } from "@/components/Stepper/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  bulkLitigatiions,
  createLitigation,
} from "../../../litigation/services";
import {
  ContactType,
  FieldConfig,
  getManagementCombination,
} from "../../config/management-types";
import { buildEmailPayload } from "../../services/email-builder";
import { buildMultipleEmailPayload } from "../../services/email-builder-multiple";
import {
  sendTrackEmail,
  sendMultipleManagementEmail,
} from "../../services/email-sender";
import { createPaymentPlan } from "../../services/payment-plan";
import { createTrack } from "../../services/tracks";
import { CaseData } from "../../types/track";
import { SavedManagementCard } from "./saved-management-card";
import { StepOne, StepThree, StepTwo } from "./steps";

interface AddManagementTabProps {
  dataDebtor: any;
  session?: any;
  profile?: any;
}

export interface DebtorContact {
  id: string;
  type: string;
  value: string;
  label: string;
  name?: string;
}
export interface ManagementFormData {
  managementType: string;
  debtorComment: string;
  executiveComment: string;
  contactType: ContactType | "";
  contactValue: string;
  selectedContact?: DebtorContact | null;
  observation: string;
  nextManagementDate: string | Date;
  nextManagementTime: string;
  caseData: CaseData;
  file?: File | null;
  comment?: string;
  sendEmail?: boolean;
}

export interface SavedManagement {
  id: string;
  formData: ManagementFormData;
  selectedInvoices: Invoice[];
  createdAt: Date;
}

// Definir los 3 pasos del stepper
const steps: Step[] = [
  { id: 1, label: "Paso 1", completed: false },
  { id: 2, label: "Paso 2", completed: false },
  { id: 3, label: "Paso 3", completed: false },
];

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
      selectedContact: null,
      observation: "",
      nextManagementDate: "",
      nextManagementTime: "",
      caseData: {},
      file: null,
      comment: "",
      sendEmail: true,
    });

  const [stepValidations, setStepValidations] = useState({
    step1: false,
    step2: false,
    step3: true,
  });

  const handleStep1ValidationChange = useCallback((isValid: boolean) => {
    setStepValidations((prev) => ({ ...prev, step1: isValid }));
  }, []);

  const handleStep2ValidationChange = useCallback((isValid: boolean) => {
    setStepValidations((prev) => ({ ...prev, step2: isValid }));
  }, []);

  // Función para avanzar al siguiente paso
  const handleNext = async () => {
    const { toast } = await import("sonner");

    if (currentStep === 0 && !stepValidations.step1) {
      toast.error("Debe seleccionar al menos una factura para continuar");
      return;
    }

    if (currentStep === 1 && !stepValidations.step2) {
      toast.error(
        "Debe completar todos los campos requeridos en la gestión para continuar"
      );
      return;
    }

    if (currentStep < steps.length - 1) {
      const newSteps = [...stepsState];
      newSteps[currentStep].completed = true;
      setStepsState(newSteps);
      setCurrentStep(currentStep + 1);
    } else {
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
  const handleInvoicesSelected = useCallback((invoices: Invoice[]) => {
    setSelectedInvoices(invoices);
  }, []);

  // Función para manejar cambios en el formulario de gestión
  const handleManagementFormChange = useCallback(
    (data: Partial<ManagementFormData>) => {
      setManagementFormData((prev) => ({ ...prev, ...data }));
    },
    []
  );

  // Función para resetear el formulario de gestión (Step 2 y 3)
  const resetManagementForm = () => {
    setManagementFormData({
      managementType: "",
      debtorComment: "",
      executiveComment: "",
      contactType: "",
      contactValue: "",
      selectedContact: null,
      observation: "",
      nextManagementDate: "",
      nextManagementTime: "",
      caseData: {},
      file: null,
      comment: "",
      sendEmail: true,
    });
  };

  const validateManagementData = () => {
    if (!session?.token || !profile?.client_id || !dataDebtor?.id) {
      throw new Error("Faltan datos de sesión o perfil");
    }

    if (
      !managementFormData.managementType ||
      !managementFormData.debtorComment ||
      !managementFormData.executiveComment
    ) {
      throw new Error("Debe completar la selección de gestión");
    }

    if (!managementFormData.contactType || !managementFormData.contactValue) {
      throw new Error("Debe seleccionar un contacto");
    }

    if (selectedInvoices.length === 0) {
      throw new Error("Debe seleccionar al menos una factura");
    }
  };

  const formatDateToISO = (dateValue: string | Date | undefined): string => {
    if (!dateValue) return new Date().toISOString();

    let dateObj: Date;

    if (dateValue instanceof Date) {
      dateObj = dateValue;
    } else if (typeof dateValue === "string") {
      dateObj = new Date(dateValue);
    } else {
      dateObj = new Date();
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const createLitigationsAndGetIds = async (): Promise<string[]> => {
    if (!managementFormData.caseData?.litigationData) {
      return [];
    }

    const litigationData = managementFormData.caseData.litigationData;
    const litigations = litigationData.litigations || [];

    const createdIds: string[] = [];
    const isFactoring = profile?.client?.type === "FACTORING";

    for (const litigation of litigations) {
      // Construir el array de facturas con toda la información requerida
      const invoicesArray = litigation.selectedInvoiceIds.map(
        (invoiceId: string) => {
          const invoice = selectedInvoices.find((inv) => inv.id === invoiceId);
          return {
            documentType: invoice?.type || "INVOICE",
            invoiceNumber: invoice?.number || "",
            invoiceAmount: invoice?.balance?.toString() || "0",
            litigationAmount: litigation.invoiceAmounts[invoiceId] || "0",
            reason: litigation.reason,
            subreason: litigation.subreason,
          };
        }
      );

      const litigationPayload: any = {
        debtorId: dataDebtor.id,
        contact: managementFormData.selectedContact?.id || "",
        initial_comment: managementFormData.observation || "",
        invoices: invoicesArray,
      };

      if (isFactoring && profile.client_id) {
        litigationPayload.client = profile.client_id;
      }

      const result = await createLitigation({
        accessToken: session.token,
        clientId: profile.client_id,
        dataToInsert: litigationPayload,
      });

      if (result.success) {
        const successes = result.data?.successes;

        if (successes && Array.isArray(successes)) {
          const ids = successes
            .map((litigation: any) => litigation.id)
            .filter((id: any) => id);

          createdIds.push(...ids);
        } else {
          throw new Error("No se pudo obtener los IDs de los litigios creados");
        }
      } else {
        throw new Error(result.message || "Error al crear litigio");
      }
    }

    return createdIds;
  };

  const normalizeLitigationsAndGetIds = async (): Promise<string[]> => {
    if (!managementFormData.caseData?.litigationData) {
      return [];
    }
    const normalizationData = managementFormData.caseData.litigationData;

    const litigationIds = normalizationData.litigationIds || [];

    if (litigationIds.length === 0) {
      throw new Error("No hay litigios seleccionados para normalizar");
    }

    const normalizationPayload = {
      litigation_ids: litigationIds,
      normalization_reason: normalizationData.reason,
      normalization_by_contact:
        managementFormData.selectedContact?.id ||
        managementFormData.contactValue,
      comment: normalizationData.comment,
    };

    const result = await bulkLitigatiions(
      session.token,
      profile.client_id,
      normalizationPayload
    );

    if (result.success) {
      return litigationIds;
    } else {
      throw new Error(result.message || "Error al normalizar litigios");
    }
  };

  const createPaymentPlanAndGetId = async (): Promise<string[]> => {
    if (!managementFormData.caseData?.paymentPlanData) {
      return [];
    }

    const paymentPlanData = managementFormData.caseData.paymentPlanData;
    const totalAmount = selectedInvoices.reduce((sum, invoice) => {
      const amount =
        typeof invoice.balance === "string"
          ? parseFloat(invoice.balance)
          : invoice.balance;
      return Math.round(sum + (isNaN(amount) ? 0 : amount));
    }, 0);

    const paymentPlanPayload = {
      debtorId: dataDebtor.id,
      selectedInvoices: selectedInvoices.map((inv) => inv.id),
      totalAmount: totalAmount,
      downPayment: paymentPlanData.downPayment || 0,
      numberOfInstallments: paymentPlanData.numberOfInstallments,
      annualInterestRate: paymentPlanData.annualInterestRate,
      paymentMethod: paymentPlanData.paymentMethod,
      paymentFrequency: paymentPlanData.paymentFrequency,
      startDate: formatDateToISO(paymentPlanData.startDate),
      comments: paymentPlanData.comments || "",
    };

    const result = await createPaymentPlan({
      accessToken: session.token,
      clientId: profile.client_id,
      dataToInsert: paymentPlanPayload,
    });

    if (result.success && result.data?.id) {
      return [result.data.id];
    } else {
      throw new Error(result.message || "Error al crear plan de pago");
    }
  };

  const buildTrackPayload = (litigationIds?: string[], paymentPlanIds?: string[]) => {
    const dateISO = formatDateToISO(managementFormData.nextManagementDate);
    const time = managementFormData.nextManagementTime || "00:00";
    const nextManagementDateTime = `${dateISO}T${time}:00.000Z`;

    const payload: any = {
      debtor_id: dataDebtor.id,
      management_type: managementFormData.managementType,
      contact: {
        type: managementFormData.contactType,
        value: managementFormData.contactValue,
      },
      observation: managementFormData.observation,
      debtor_comment: managementFormData.debtorComment,
      executive_comment: managementFormData.executiveComment,
      next_management_date: nextManagementDateTime,
      invoice_ids: selectedInvoices.map((inv) => inv.id),
    };

    if (
      managementFormData.caseData &&
      Object.keys(managementFormData.caseData).length > 0
    ) {
      const selectedCombination = getManagementCombination(
        managementFormData.managementType,
        managementFormData.debtorComment,
        managementFormData.executiveComment
      );

      // Caso especial: litigation
      if (
        selectedCombination?.executive_comment === "DOCUMENT_IN_LITIGATION" &&
        litigationIds
      ) {
        // Asegurar que todos los IDs sean strings
        const validatedIds = litigationIds
          .filter((id) => id && typeof id === "string")
          .map((id) => id.toString());

        payload.case_data = {
          litigationIds: validatedIds,
        };
      } else if (
        selectedCombination?.executive_comment === "LITIGATION_NORMALIZATION" &&
        litigationIds
      ) {
        // Caso especial: normalización de litigios
        // Solo incluir litigationIds en case_data (sin reason, comment, totalAmount)
        const validatedIds = litigationIds
          .filter((id) => id && typeof id === "string")
          .map((id) => id.toString());

        payload.case_data = {
          litigationIds: validatedIds,
        };

        // Sobrescribir invoice_ids con solo las facturas seleccionadas para normalización
        const normalizationData = managementFormData.caseData.litigationData;
        if (normalizationData?.selectedInvoiceIds) {
          payload.invoice_ids = normalizationData.selectedInvoiceIds;
        }
      } else if (
        selectedCombination?.executive_comment === "PAYMENT_PLAN_APPROVAL_REQUEST" &&
        paymentPlanIds
      ) {
        // Caso especial: plan de pago
        const validatedIds = paymentPlanIds
          .filter((id) => id && typeof id === "string")
          .map((id) => id.toString());

        payload.case_data = {
          paymentPlanIds: validatedIds,
        };
      } else {
        // Caso normal: otros tipos de gestión
        const normalizedCaseData: any = {};

        for (const [key, value] of Object.entries(
          managementFormData.caseData
        )) {
          if (value === null || value === undefined || value === "") {
            continue;
          }

          const fieldConfig = selectedCombination?.fields?.find(
            (f: FieldConfig) => f.name === key
          );

          if (value instanceof Date) {
            normalizedCaseData[key] = formatDateToISO(value);
          } else if (fieldConfig?.type === "number") {
            const numValue =
              typeof value === "string" ? parseFloat(value) : value;
            normalizedCaseData[key] = isNaN(numValue as number)
              ? value
              : numValue;
          } else {
            normalizedCaseData[key] = value;
          }
        }

        payload.case_data = normalizedCaseData;
      }
    }
    return payload;
  };

  const handleAddManagement = async () => {
    setIsSubmitting(true);
    try {
      validateManagementData();

      // Si es litigation, crear los litigios primero
      let litigationIds: string[] | undefined;
      let paymentPlanIds: string[] | undefined;

      if (
        managementFormData.executiveComment === "DOCUMENT_IN_LITIGATION" &&
        managementFormData.caseData?.litigationData
      ) {
        toast.info("Creando litigios...");
        litigationIds = await createLitigationsAndGetIds();
        toast.success(`${litigationIds.length} litigio(s) creado(s)`);
      } else if (
        managementFormData.executiveComment === "LITIGATION_NORMALIZATION" &&
        managementFormData.caseData?.litigationData
      ) {
        toast.info("Normalizando litigios...");
        litigationIds = await normalizeLitigationsAndGetIds();
        toast.success(`${litigationIds.length} litigio(s) normalizado(s)`);
      } else if (
        managementFormData.executiveComment === "PAYMENT_PLAN_APPROVAL_REQUEST" &&
        managementFormData.caseData?.paymentPlanData
      ) {
        toast.info("Creando plan de pago...");
        paymentPlanIds = await createPaymentPlanAndGetId();
        toast.success("Plan de pago creado");
      }

      const payload = buildTrackPayload(litigationIds, paymentPlanIds);

      const result = await createTrack(
        session.token,
        profile.client_id,
        payload
      );

      toast.success("Gestión agregada exitosamente");

      const newManagement: SavedManagement = {
        id: result.track.id,
        formData: { ...managementFormData },
        selectedInvoices: [...selectedInvoices],
        createdAt: new Date(result.track.created_at),
      };

      setSavedManagements((prev) => [...prev, newManagement]);

      resetManagementForm();
      setSelectedInvoices([]);

      setCurrentStep(0);

      setStepsState(steps.map((step) => ({ ...step, completed: false })));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear gestión"
      );
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
      validateManagementData();

      // Si es litigation, crear los litigios primero
      let litigationIds: string[] | undefined;
      let paymentPlanIds: string[] | undefined;

      if (
        managementFormData.executiveComment === "DOCUMENT_IN_LITIGATION" &&
        managementFormData.caseData?.litigationData
      ) {
        toast.info("Creando litigios...");
        litigationIds = await createLitigationsAndGetIds();
        toast.success(`${litigationIds.length} litigio(s) creado(s)`);
      } else if (
        managementFormData.executiveComment === "LITIGATION_NORMALIZATION" &&
        managementFormData.caseData?.litigationData
      ) {
        toast.info("Normalizando litigios...");
        litigationIds = await normalizeLitigationsAndGetIds();
        toast.success(`${litigationIds.length} litigio(s) normalizado(s)`);
      } else if (
        managementFormData.executiveComment === "PAYMENT_PLAN_APPROVAL_REQUEST" &&
        managementFormData.caseData?.paymentPlanData
      ) {
        toast.info("Creando plan de pago...");
        paymentPlanIds = await createPaymentPlanAndGetId();
        toast.success("Plan de pago creado");
      }

      const payload = buildTrackPayload(litigationIds, paymentPlanIds);

      const result = await createTrack(session.token, profile.client_id, payload);

      const currentManagement: SavedManagement = {
        id: result.track.id,
        formData: { ...managementFormData },
        selectedInvoices: [...selectedInvoices],
        createdAt: new Date(result.track.created_at),
      };

      const allManagements = [...savedManagements, currentManagement];

      const managementsToEmail = allManagements.filter(
        (m) => m.formData.sendEmail === true
      );

      if (managementsToEmail.length > 0) {
        const groupedByContact: Record<
          string,
          { managements: SavedManagement[]; contactName: string }
        > = {};

        managementsToEmail.forEach((management) => {
          const contactEmail = management.formData.contactValue;
          const contactName =
            management.formData.selectedContact?.name ||
            management.formData.selectedContact?.label ||
            "Contacto";

          if (!groupedByContact[contactEmail]) {
            groupedByContact[contactEmail] = {
              managements: [],
              contactName,
            };
          }
          groupedByContact[contactEmail].managements.push(management);
        });

        const sortedGroups = Object.entries(groupedByContact).map(
          ([email, data]) => ({
            email,
            contactName: data.contactName,
            managements: data.managements.sort(
              (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            ),
          })
        );

        for (const group of sortedGroups) {
          try {
            if (group.managements.length === 1) {
              const management = group.managements[0];
              const selectedCombination = getManagementCombination(
                management.formData.managementType,
                management.formData.debtorComment,
                management.formData.executiveComment
              );

              if (selectedCombination) {
                const emailPayload = buildEmailPayload({
                  managementFormData: management.formData,
                  selectedInvoices: management.selectedInvoices,
                  profile,
                  managementCombination: selectedCombination,
                });

                const emailResult = await sendTrackEmail(emailPayload);

                if (emailResult.success) {
                  toast.success(`Email enviado a ${group.email}`);
                } else {
                  toast.warning(
                    `Email a ${group.email} no pudo enviarse`
                  );
                }
              }
            } else {
              const emailPayload = buildMultipleEmailPayload({
                managements: group.managements,
                profile,
                contactEmail: group.email,
                contactName: group.contactName,
              });

              const emailResult = await sendMultipleManagementEmail(
                emailPayload
              );

              if (emailResult.success) {
                toast.success(
                  `Email de ${group.managements.length} gestiones enviado a ${group.email}`
                );
              } else {
                toast.warning(
                  `Email a ${group.email} no pudo enviarse`
                );
              }
            }
          } catch (error) {
            toast.warning(`Error al enviar email a ${group.email}`);
          }
        }
      }

      const totalCreated = savedManagements.length + 1;
      toast.success(
        `Proceso completado. ${totalCreated} gestión(es) creada(s) exitosamente`
      );

      setSavedManagements([]);
      resetManagementForm();
      setSelectedInvoices([]);
      setCurrentStep(0);
      setStepsState(steps.map((step) => ({ ...step, completed: false })));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear la gestión final"
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
            selectedInvoices={selectedInvoices}
            onInvoicesSelected={handleInvoicesSelected}
            onValidationChange={handleStep1ValidationChange}
          />
        );
      case 1:
        return (
          <StepTwo
            dataDebtor={dataDebtor}
            formData={managementFormData}
            onFormChange={handleManagementFormChange}
            selectedInvoices={selectedInvoices}
            onValidationChange={handleStep2ValidationChange}
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
    // <div className="bg-white p-6 rounded-md h-full border border-gray-300 mt-5">
    <div className="bg-white h-full  mt-5">
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
                  disabled={
                    isSubmitting ||
                    !stepValidations.step1 ||
                    !stepValidations.step2
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  Agregar gestión
                </Button>
                <Button
                  className="h-11 rounded-sm bg-primary hover:bg-primary/90"
                  onClick={handleFinish}
                  disabled={
                    isSubmitting ||
                    !stepValidations.step1 ||
                    !stepValidations.step2
                  }
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
                disabled={
                  isSubmitting ||
                  (currentStep === 0 && !stepValidations.step1) ||
                  (currentStep === 1 && !stepValidations.step2)
                }
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
