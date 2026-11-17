import { useState } from "react";
import { Eye, EyeOff, ZoomIn, ZoomOut } from "lucide-react";
import { EnterpriseDocument, ExtractedField } from "../types/documind";

interface DocumentSheetPreviewProps {
  document: EnterpriseDocument;
  selectedFieldKey: string | null;
  onSelectField: (field: ExtractedField) => void;
}

export function DocumentSheetPreview({
  document,
  selectedFieldKey,
  onSelectField,
}: DocumentSheetPreviewProps) {
  const [showBoxes, setShowBoxes] = useState(true);
  const [zoom, setZoom] = useState<number>(100);

  return (
    <div className="flex flex-col rounded-lg border border-white/8 bg-[#0b0f19] overflow-hidden">
      {/* Preview Mini-Toolbar */}
      <div className="h-8 px-3 bg-[#131b2e] border-b border-white/8 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 text-[#94a3b8] font-mono tabular-nums truncate">
          <span>Page 1 / {document.pages}</span>
          <span aria-hidden="true" className="text-[#464555]">·</span>
          <span className="truncate">{document.fileName}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowBoxes((v) => !v)}
            className={`h-6 px-2 rounded flex items-center gap-1 text-[11px] transition-colors ${
              showBoxes
                ? "bg-[#4f46e5]/20 text-[#c3c0ff] border border-[#4f46e5]/40"
                : "text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {showBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>OCR Boxes</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(75, z - 15))}
            aria-label="Zoom out"
            className="w-6 h-6 rounded flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/5"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="font-mono tabular-nums text-[#94a3b8] w-9 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(130, z + 15))}
            aria-label="Zoom in"
            className="w-6 h-6 rounded flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/5"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Document Sheet Stage */}
      <div className="p-3 bg-[#060e20] overflow-auto max-h-[340px]">
        <div
          className="relative mx-auto bg-[#f8fafc] text-[#0f172a] rounded shadow-md border border-slate-300/60 overflow-hidden origin-top transition-transform duration-150"
          style={{
            width: `${Math.round((100 * zoom) / 100)}%`,
            minHeight: "290px",
          }}
        >
          {document.uploadedImageDataUrl ? (
            <img
              src={document.uploadedImageDataUrl}
              alt={document.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto block object-contain bg-white"
            />
          ) : (
            <SimulatedEnterprisePage document={document} />
          )}

          {/* Interactive OCR Bounding Box Overlays */}
          {showBoxes &&
            document.fields.map((field) => {
              const isSelected = selectedFieldKey === field.key;
              const isWarning = field.status === "warning";
              return (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => onSelectField(field)}
                  title={`${field.label}: ${field.value} (${field.confidence.toFixed(1)}%)`}
                  style={{
                    left: `${field.bbox.x}%`,
                    top: `${field.bbox.y}%`,
                    width: `${field.bbox.w}%`,
                    height: `${field.bbox.h}%`,
                  }}
                  className={`absolute rounded-xs text-left transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? "bg-[#4f46e5]/25 border-2 border-[#4f46e5] ring-2 ring-[#4f46e5]/30 z-20"
                      : isWarning
                        ? "bg-amber-500/20 border border-amber-500 hover:bg-amber-500/30 z-10"
                        : "bg-[#4f46e5]/12 border border-[#4f46e5]/70 hover:bg-[#4f46e5]/22 z-10"
                  }`}
                >
                  <span
                    className={`absolute -top-4 left-0 px-1 py-px rounded-xs font-mono text-[9px] leading-none whitespace-nowrap pointer-events-none ${
                      isSelected
                        ? "bg-[#4f46e5] text-white"
                        : isWarning
                          ? "bg-amber-600 text-white"
                          : "bg-slate-900/90 text-slate-100"
                    }`}
                  >
                    {field.key} · {field.confidence.toFixed(0)}%
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function SimulatedEnterprisePage({ document }: { document: EnterpriseDocument }) {
  const isSkewed = document.status === "failed";

  return (
    <div
      className={`p-5 text-[11px] leading-relaxed select-none ${
        isSkewed ? "rotate-[1.8deg] opacity-85" : ""
      }`}
      style={{ minHeight: "290px" }}
    >
      {/* Document Header */}
      <div className="flex items-start justify-between border-b border-slate-300 pb-2.5 mb-3">
        <div>
          <div className="text-[12px] font-bold tracking-tight text-slate-900">
            {document.documentHeaderMeta.issuer}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {document.schemaName} · {document.documentHeaderMeta.refCode}
          </div>
        </div>
        <div className="text-right font-mono text-[10px] text-slate-600">
          <div>{document.documentHeaderMeta.dateLabel}</div>
          <div className="text-slate-400">SHA256:{document.sha256Prefix}</div>
        </div>
      </div>

      {/* Rendered Field Anchors Aligned With BBox Regions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 pt-1">
          {document.fields.slice(0, 2).map((f) => (
            <div key={f.key} className="py-1">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                {f.label}
              </div>
              <div className="text-[11px] font-semibold text-slate-900 truncate">{f.value}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-2.5 grid grid-cols-2 gap-3">
          {document.fields.slice(2, 4).map((f) => (
            <div key={f.key} className="py-1">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                {f.label}
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-900 truncate">
                {f.value}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-2.5 space-y-2">
          {document.fields.slice(4).map((f) => (
            <div key={f.key} className="flex items-baseline justify-between gap-2 py-0.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                {f.label}
              </span>
              <span className="text-[11px] font-medium text-slate-900 font-mono truncate">
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {document.status === "warning" && (
          <div className="mt-2 inline-block border border-rose-400/70 text-rose-600/80 font-mono text-[9px] px-2 py-0.5 rotate-[-3deg]">
            RECEIVED / STAMP OVERLAP DETECTED
          </div>
        )}
      </div>
    </div>
  );
}
