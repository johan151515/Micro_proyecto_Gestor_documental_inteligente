import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { DocumentStatus } from "../types/documind";

interface StatusIndicatorProps {
  status: DocumentStatus;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  DocumentStatus,
  {
    label: string;
    shortLabel: string;
    classes: string;
    Icon: typeof CheckCircle2;
    spin?: boolean;
  }
> = {
  validated: {
    label: "Validated",
    shortLabel: "Validated",
    classes: "bg-emerald-500/12 text-[#34d399] border-emerald-500/25",
    Icon: CheckCircle2,
  },
  processing: {
    label: "AI Parsing",
    shortLabel: "Parsing",
    classes: "bg-blue-500/12 text-[#60a5fa] border-blue-500/25",
    Icon: Loader2,
    spin: true,
  },
  warning: {
    label: "Low Confidence",
    shortLabel: "Review",
    classes: "bg-amber-500/12 text-[#fbbf24] border-amber-500/25",
    Icon: AlertTriangle,
  },
  failed: {
    label: "Extraction Failed",
    shortLabel: "Failed",
    classes: "bg-rose-500/12 text-[#f87171] border-rose-500/25",
    Icon: XCircle,
  },
};

export function StatusIndicator({ status, compact = false }: StatusIndicatorProps) {
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded border whitespace-nowrap shrink-0 ${cfg.classes}`}
    >
      <Icon className={`w-3 h-3 shrink-0 ${cfg.spin ? "animate-spin" : ""}`} />
      <span>{compact ? cfg.shortLabel : cfg.label}</span>
    </span>
  );
}
