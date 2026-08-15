import { Skeleton } from "@/components/ui/skeleton";
import { Handshake, Target, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

interface CallBriefField {
  label: string;
  value: string;
}

interface CallBriefSection {
  title: string;
  fields: CallBriefField[];
}

const SECTION_KEYS = ["situation", "focus", "negotiation"] as const;
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
};

function stripMarkdownSyntax(raw: string): string {
  return raw
    .replace(/```markdown\n?/g, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "");
}

function parseCallBrief(
  raw: string
): Partial<Record<SectionKey, CallBriefSection>> | null {
  const text = raw
    .replace(/```markdown\n?/g, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "");

  const sectionMatches = [
    ...text.matchAll(/^(?!-)[^\n]*?\b(LECTURA|FOCO|CONTROL)\b[^\n]*$/gim),
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
    if (!key) continue;

    const fields: CallBriefField[] = [];
    const fieldMatches = body.matchAll(/^-\s*([A-ZÁÉÍÓÚÑ0-9 ()]+?):\s*(.+)$/gm);
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
            <div className="space-y-2">
              {section.fields.map((field, idx) => (
                <div key={idx} className="text-xs">
                  <span
                    className={`font-semibold uppercase ${style.labelColor}`}
                  >
                    {field.label}:
                  </span>{" "}
                  <span className="text-gray-700">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
