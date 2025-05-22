import { Step } from "@/components/Stepper/types";

export interface StepLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export interface OnboardingStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  steps: Step[];
  onStepChange: (step: number) => void;
}
