import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Handshake,
  Target,
  TriangleAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface CallBriefField {
  label: string;
  value: string;
}

interface CallBriefSection {
  title: string;
  fields: CallBriefField[];
}

const SECTION_KEYS = ["needs", "focus", "negotiation", "situation"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

const SECTION_STYLES: Record<
  SectionKey,
  {
    icon: typeof TriangleAlert;
    accent: string;
    headerColor: string;
    labelColor: string;
  }
> = {
  situation: {
    icon: TriangleAlert,
    accent: "border-l-red-400",
    headerColor: "text-red-600",
    labelColor: "text-red-600",
  },
  focus: {
    icon: Target,
    accent: "border-l-orange-400",
    headerColor: "text-orange-600",
    labelColor: "text-orange-600",
  },
  negotiation: {
    icon: Handshake,
    accent: "border-l-green-500",
    headerColor: "text-green-700",
    labelColor: "text-green-700",
  },
  needs: {
    icon: FileText,
    accent: "border-l-blue-500",
    headerColor: "text-blue-700",
    labelColor: "text-blue-700",
  },
};

const NEGOTIATION_PRIMARY = ["PREGUNTA CLAVE", "ACEPTA", "NO ACEPTA"];

const NEED_MARKERS: Record<string, { dot: string; row: string }> = {
  "🔴": { dot: "bg-red-500", row: "bg-red-50 border-red-200" },
  "🟠": { dot: "bg-orange-400", row: "bg-orange-50 border-orange-200" },
};

const NEUTRAL_NEED = { dot: "bg-gray-300", row: "bg-gray-50 border-gray-200" };

function NeedRow({ field }: { field: CallBriefField }) {
  const marker = Object.keys(NEED_MARKERS).find((m) =>
    field.label.startsWith(m),
  );
  const style = marker ? NEED_MARKERS[marker] : NEUTRAL_NEED;
  const label = marker ? field.label.slice(marker.length).trim() : field.label;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
        style.row,
      )}
    >
      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", style.dot)} />
      <span className="font-semibold text-gray-900 shrink-0">{label}</span>
      <span className="text-gray-700">{field.value}</span>
    </div>
  );
}

function FieldLine({
  field,
  labelColor,
}: {
  field: CallBriefField;
  labelColor: string;
}) {
  return (
    <div className="text-xs">
      <span className={`font-semibold uppercase ${labelColor}`}>
        {field.label}:
      </span>{" "}
      <span className="text-gray-700">{field.value}</span>
    </div>
  );
}

function NegotiationFields({
  fields,
  labelColor,
}: {
  fields: CallBriefField[];
  labelColor: string;
}) {
  const t = useTranslations("debtorManagement.callBrief");
  const [expanded, setExpanded] = useState(false);
  const isPrimary = (f: CallBriefField) =>
    NEGOTIATION_PRIMARY.includes(f.label.toUpperCase());
  const primary = fields.filter(isPrimary);
  const secondary = fields.filter((f) => !isPrimary(f));
  const visible = primary.length > 0 ? primary : fields;
  const hidden = primary.length > 0 ? secondary : [];

  return (
    <div className="space-y-2">
      {visible.map((field, idx) => (
        <FieldLine key={idx} field={field} labelColor={labelColor} />
      ))}
      {hidden.length > 0 && (
        <>
          {expanded &&
            hidden.map((field, idx) => (
              <FieldLine key={idx} field={field} labelColor={labelColor} />
            ))}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? t("showLess") : t("showMore")}
          </button>
        </>
      )}
    </div>
  );
}

function stripMarkdownSyntax(raw: string): string {
  return raw
    .replace(/```markdown\n?/g, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "");
}

function parseCallBrief(
  raw: string,
): Partial<Record<SectionKey, CallBriefSection>> | null {
  const text = raw
    .replace(/```markdown\n?/g, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "");

  const sectionMatches = [
    ...text.matchAll(
      /^(?!-)[^\n]*?\b(LECTURA|FOCO|CONTROL|NECESITA)\b[^\n]*$/gim,
    ),
  ];
  if (sectionMatches.length === 0) return null;

  const result: Partial<Record<SectionKey, CallBriefSection>> = {};

  for (let i = 0; i < sectionMatches.length; i++) {
    const match = sectionMatches[i];
    const heading = match[0].toUpperCase();
    const keyword = match[1].toUpperCase();
    const start = (match.index ?? 0) + match[0].length;
    const end = sectionMatches[i + 1]?.index ?? text.length;
    const body = text.slice(start, end);

    let key: SectionKey | null = null;
    if (keyword === "LECTURA") key = "situation";
    else if (keyword === "FOCO") key = "focus";
    else if (keyword === "CONTROL") key = "negotiation";
    else if (keyword === "NECESITA") key = "needs";
    if (!key) continue;

    const fields: CallBriefField[] = [];
    const fieldPattern =
      key === "needs"
        ? /^-\s*([^:\n]{1,40}?):\s*(.+)$/gm
        : /^-\s*([A-ZÁÉÍÓÚÑ0-9 ()]+?):\s*(.+)$/gm;
    const fieldMatches = body.matchAll(fieldPattern);
    for (const fieldMatch of fieldMatches) {
      const label = fieldMatch[1].trim();
      const value = fieldMatch[2].trim();
      if (label && value) fields.push({ label, value });
    }

    if (fields.length > 0) {
      result[key] = { title: heading, fields };
    }
  }

  if (SECTION_KEYS.every((key) => !result[key])) return null;

  return result;
}

function CallBriefSkeleton() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="p-4 border-b border-gray-100">
          <Skeleton className="h-5 w-40 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CallBriefCardsProps {
  callBrief: string | null;
  isFetchingCallBrief: boolean;
}

export function CallBriefCards({
  callBrief,
  isFetchingCallBrief,
}: CallBriefCardsProps) {
  const t = useTranslations("debtorManagement.callBrief");

  if (isFetchingCallBrief) return <CallBriefSkeleton />;
  if (!callBrief) return null;

  const parsed = parseCallBrief(callBrief);

  if (!parsed) {
    return (
      <div className="p-4 border-b border-gray-100 whitespace-pre-wrap text-sm text-gray-700">
        {stripMarkdownSyntax(callBrief)}
      </div>
    );
  }

  return (
    <div>
      {SECTION_KEYS.map((key) => {
        const section = parsed[key];
        if (!section) return null;
        const style = SECTION_STYLES[key];
        const Icon = style.icon;

        return (
          <div
            key={key}
            className={`p-4 border-b border-gray-100 border-l-4 ${style.accent}`}
          >
            <h3
              className={`text-sm font-semibold mb-2 flex items-center gap-2 ${style.headerColor}`}
            >
              <Icon size={15} />
              {t(`sections.${key}`)}
            </h3>
            {key === "needs" ? (
              <div className="space-y-1.5">
                {section.fields.map((field, idx) => (
                  <NeedRow key={idx} field={field} />
                ))}
              </div>
            ) : key === "negotiation" ? (
              <NegotiationFields
                fields={section.fields}
                labelColor={style.labelColor}
              />
            ) : (
              <div className="space-y-2">
                {section.fields.map((field, idx) => (
                  <FieldLine
                    key={idx}
                    field={field}
                    labelColor={style.labelColor}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
