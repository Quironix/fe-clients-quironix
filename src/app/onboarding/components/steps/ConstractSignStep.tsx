"use client";

import Stepper from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfileContext } from "@/context/ProfileContext";
import { FileText } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { signContract } from "../../services";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import { ContinueAndBackButtons } from "./ContinueAndBackButtons";

const ContractSignStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const [hasReadContract, setHasReadContract] = useState<boolean>(false);
  const [contractSigned, setContractSigned] = useState<boolean>(false);
  const [isSigningContract, setIsSigningContract] = useState<boolean>(false);
  const { session } = useProfileContext();

  const handleOpenContract = () => {
    if (profile?.client?.contract) {
      window.open(profile.client.contract, "_blank");
      setHasReadContract(true);
    }
  };

  const handleContractSigning = (checked: boolean) => {
    setContractSigned(checked);
  };

  const handleSignContract = async () => {
    if (profile?.client?.id) {
      setIsSigningContract(true);
      const success = await signContract(
        session?.token as string,
        profile?.client?.id as string
      );
      setIsSigningContract(false);
      if (!success.error) {
        onNext();
      } else {
        toast.error(success.error);
      }
    }
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
        <div className="p-8 h-[70%]">
          <div className="">
            <div className="h-full">
              <div className="flex justify-between items-center border border-gray-300 rounded-lg h-full">
                <div className="w-1/2 h-[250px]">
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
                    onClick={handleOpenContract}
                  >
                    <FileText className="w-4 h-4 mr-2 text-orange-300" /> Leer
                    contrato
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 mt-6">
                <Checkbox
                  id="terms"
                  checked={contractSigned}
                  onCheckedChange={handleContractSigning}
                  disabled={!hasReadContract}
                />
                <label
                  htmlFor="terms"
                  className={`text-sm font-medium leading-none ${
                    !hasReadContract ? "text-gray-400" : ""
                  }`}
                >
                  Firmar contrato
                </label>
              </div>
            </div>
          </div>
        </div>

        <ContinueAndBackButtons
          isFirstStep={isFirstStep}
          onBack={onBack}
          loading={isSigningContract}
          blockContinue={!contractSigned || isSigningContract}
          onContinue={handleSignContract}
        />
      </section>
    </StepLayout>
  );
};

export default ContractSignStep;
