"use client";

import React, { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

import { locales, type Locale } from "@/i18n/config";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";

const localeLabels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

const Language = () => {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};max-age=31536000;path=/`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-end items-center gap-2">
        <Image
          src="/img/logo-quironix.svg"
          alt="logo"
          width={100}
          height={100}
        />
        <div>
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger
              className="flex items-center gap-2"
              disabled={isPending}
            >
              <Globe className="w-4 h-4" />
              <span>{localeLabels[locale as Locale]}</span>
            </SelectTrigger>
            <SelectContent>
              {locales.map((l) => (
                <SelectItem key={l} value={l}>
                  {localeLabels[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Language;
