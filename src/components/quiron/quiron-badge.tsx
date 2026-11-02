import { QuironIcon } from "./quiron-icon";

export const QuironBadge = () => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap"
    style={{
      backgroundColor: "color-mix(in srgb, var(--quiron) 15%, transparent)",
      color: "var(--quiron-dark)",
    }}
  >
    <QuironIcon size={12} />
    Quirón
  </span>
);
