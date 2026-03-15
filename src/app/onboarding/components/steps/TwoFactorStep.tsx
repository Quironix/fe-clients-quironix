"use client";

import Stepper from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { verifyCode } from "../../services";
import useOnboardingStore from "../../store";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";
import { ContinueAndBackButtons } from "./ContinueAndBackButtons";

const COUNTDOWN_TIME = 120;

const createTwoFactorSchema = (t: ReturnType<typeof useTranslations<"onboarding">>) =>
  z.object({
    code: z.string().min(6, t("twoFactor.validation.codeMin")),
  });

type TwoFactorFormData = z.infer<ReturnType<typeof createTwoFactorSchema>>;

const TwoFactorStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const { session } = useProfileContext();
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const { sendCode, error, loading } = useOnboardingStore();
  const twoFactorSchema = createTwoFactorSchema(t);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState<boolean>(false);

  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema) as any,
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (data: TwoFactorFormData) => {
    if (profile?.client?.id && session?.token) {
      setIsValidatingCode(true);
      const success = await verifyCode(
        session?.token as string,
        profile?.client?.id as string
      );
      if (!success.error) {
        setIsCodeValid(true);
        toast.success(t("twoFactor.codeVerified"));
        onNext();
      } else {
        setIsCodeValid(false);
        toast.error(error || t("twoFactor.codeError"));
      }
      setIsValidatingCode(false);
    }
  };

  useEffect(() => {
    if (profile?.client?.id && session?.token) {
      sendCode(session?.token as string, profile?.client?.id as string);
    }
  }, [profile?.client?.id, session?.token, sendCode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResendCode = async () => {
    if (profile?.client?.id && session?.token) {
      try {
        form.reset();
        const success: any = await sendCode(
          session?.token as string,
          profile?.client?.id as string
        );

        if (!success.error) {
          toast.success(t("twoFactor.resendSuccess"));
          setCountdown(COUNTDOWN_TIME);
          setIsResendDisabled(true);
        } else {
          toast.error(error || t("twoFactor.resendError"));
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(t("twoFactor.resendError"));
      }
    }
  };

  return (
    <StepLayout
      title={t("twoFactor.title")}
      description={t("twoFactor.description")}
    >
      <section className="h-full">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="h-full"
            autoComplete="off"
          >
            <div className="p-8 h-[85%]">
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
                    <p className="mb-4 text-sm">
                      {t("twoFactor.codePrompt")}{" "}
                      <span className="font-bold">{t("twoFactor.toYourEmail")}</span>
                    </p>
                    <div className="flex justify-center flex-col items-center border border-gray-300 rounded-lg px-4 pt-10 pb-6">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <InputOTP
                                maxLength={6}
                                className="gap-3 justify-center"
                                {...field}
                                onChange={(value) => {
                                  field.onChange(value);
                                  if (value.length === 6) {
                                    form.handleSubmit(handleSubmit)();
                                  }
                                }}
                              >
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="text-center">
                        <p className="text-sm text-gray-600 inline-flex items-center gap-2">
                          {t("twoFactor.notReceived")}{" "}
                          <Button
                            onClick={handleResendCode}
                            disabled={isResendDisabled || loading}
                            className="text-orange-500 hover:text-orange-600 font-medium bg-transparent p-0 m-0 hover:bg-transparent shadow-none disabled:opacity-50 disabled:cursor-not-allowe underline"
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <Loader className="w-4 h-4 animate-spin" />
                                {tCommon("loading.sending")}
                              </span>
                            ) : isResendDisabled ? (
                              t("twoFactor.resendIn", { time: formatTime(countdown) })
                            ) : (
                              t("twoFactor.resend")
                            )}
                          </Button>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <p className="">
                      {t("twoFactor.acceptTermsIntro")}{" "}
                      <span className="font-bold">
                        {t("twoFactor.acceptTermsBody")}
                      </span>
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircleIcon className="w-5 h-5 text-primary" />
                        {t("twoFactor.acceptAccount")}
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircleIcon className="w-5 h-5 text-primary" />
                        {t("twoFactor.acceptTerms")}
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircleIcon className="w-5 h-5 text-primary" />
                        {t("twoFactor.acceptPrivacy")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <ContinueAndBackButtons
              isFirstStep={isFirstStep}
              onBack={onBack}
              loading={loading}
              form={form}
            />
            {/* <div className="h-1/6 flex justify-between items-center">
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
              <Button
                type="submit"
                className="px-6 py-2"
                disabled={!isCodeValid}
                onClick={() => {
                  onNext();
                }}
              >
                {isValidatingCode ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Continuar <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div> */}
          </form>
        </FormProvider>
      </section>
    </StepLayout>
  );
};

export default TwoFactorStep;
