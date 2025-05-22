export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export interface Step {
  id: number;
  label: string;
  completed?: boolean;
}

export interface StepItemProps {
  step: Step;
  index: number;
  isActive: boolean;
  isLast: boolean;
  onClick?: () => void;
}
