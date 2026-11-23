"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import type { AcceptedChannel } from "../../types/technical-file";

const CHANNELS: AcceptedChannel[] = ["EMAIL", "PHONE", "WHATSAPP", "PORTAL"];

interface AcceptedChannelsFieldProps {
  value: AcceptedChannel[];
  onChange: (channels: AcceptedChannel[]) => void;
}

export function AcceptedChannelsField({
  value,
  onChange,
}: AcceptedChannelsFieldProps) {
  const t = useTranslations("debtors.technicalFile");

  const toggle = (channel: AcceptedChannel, checked: boolean) =>
    onChange(
      checked ? [...value, channel] : value.filter((c) => c !== channel),
    );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {CHANNELS.map((channel) => (
          <label key={channel} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.includes(channel)}
              onCheckedChange={(checked) => toggle(channel, checked === true)}
            />
            {t(`channels.${channel}`)}
          </label>
        ))}
      </div>
      {value.includes("PORTAL") && (
        <p className="text-xs text-muted-foreground">{t("portalHint")}</p>
      )}
    </div>
  );
}
