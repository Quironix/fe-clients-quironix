import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
  text?: string;
}

export default function Loader({ className, text }: LoaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn("w-4 h-4 animate-spin", className)} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
