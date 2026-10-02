"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useProfileContext } from "@/context/ProfileContext";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Control } from "react-hook-form";
import { DatePopover } from "../../components/date-popover";
import { TimePopover } from "../../components/time-popover";
import { useHolidaySet } from "../../debtor-management/hooks/useHolidaySet";
import { isNextManagementDateDisabled } from "../../debtor-management/utils/next-management-date";

const ManagementFields = ({ control }: { control: Control<any> }) => {
  const t = useTranslations("litigation.management");
  const { session, profile } = useProfileContext();
  const holidaySet = useHolidaySet(session?.token, profile?.client_id);

  const isDateDisabled = useCallback(
    (date: Date) =>
      isNextManagementDateDisabled(date, { holidaySet, dueDateCap: null }),
    [holidaySet]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="nextManagementDate"
          render={({ field }) => (
            <DatePopover
              field={field}
              label={t("date")}
              required
              disabled={isDateDisabled}
              modal
            />
          )}
        />

        <FormField
          control={control}
          name="nextManagementTime"
          render={({ field }) => (
            <TimePopover field={field} label={t("time")} required modal />
          )}
        />
      </div>

      <FormField
        control={control}
        name="sendEmail"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="cursor-pointer">
              <Mail className="w-4 h-4" />
              {t("sendEmail")}
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ManagementFields;
