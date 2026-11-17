import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { EnterpriseDocument } from "../types/documind";
import { StatusIndicator } from "./StatusIndicator";

interface AuditExceptionsViewProps {
  documents: EnterpriseDocument[];
  onSelectDocForInspector: (doc: EnterpriseDocument) => void;
  onUpdateField: (docId: string, fieldKey: string, newValue: string) => void;
  onApproveDocument: (docId: string) => void;
  onReExtractDocument: (doc: EnterpriseDocument) => Promise<void>;
}

export function AuditExceptionsView({
  documents,
  onSelectDocForInspector,
  onUpdateField,
  onApproveDocument,
  onReExtractDocument,
}: AuditExceptionsViewProps) {
  const exceptionDocs = documents.filter(
    (d) => d.status === "warning" || d.status === "failed"
  );
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [reExtractingId, setReExtractingId] = useState<string | null>(null);

  const handleVerifyField = (docId: string, fieldKey: string, fallbackValue: string) => {
    const compositeKey = `${docId}:${fieldKey}`;
    const value = (draftValues[compositeKey] ?? fallbackValue).trim();
    if (value) {
      onUpdateField(docId, fieldKey, value);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-end justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#dae2fd] tracking-tight">
              Human-in-the-Loop Audit &amp; Exceptions
            </h2>
            <p className="text-[13px] text-[#94a3b8] mt-1">
              Verify low-confidence OCR extractions, resolve stamp or skew anomalies, and promote audited records to Validated status.
            </p>
          </div>
          <div className="font-mono tabular-nums text-[12px] text-[#fbbf24]">
            {exceptionDocs.length} pending review
          </div>
        </div>

        {exceptionDocs.length === 0 ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/8 p-8 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-[#34d399] mx-auto" />
            <div className="text-[15px] font-semibold text-[#dae2fd]">
              All OCR Exceptions Resolved
            </div>
            <p className="text-[12px] text-[#94a3b8] max-w-md mx-auto">
              Every indexed document currently meets its schema confidence gate and cryptographic audit requirements.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exceptionDocs.map((doc) => {
              const flaggedFields = doc.fields.filter((f) => f.status === "warning");
              return (
                <div
                  key={doc.id}
                  className="rounded-lg border border-white/10 bg-[#131b2e] overflow-hidden"
                >
                  {/* Exception Card Header */}
                  <div className="px-4 py-3 border-b border-white/8 bg-[#171f33] flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-[#94a3b8]">
                        <span className="text-[#c3c0ff]">{doc.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.schemaName}</span>
                        <span aria-hidden="true">·</span>
                        <span>Mean OCR {doc.confidence.toFixed(1)}%</span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-[#dae2fd] mt-0.5">
                        {doc.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusIndicator status={doc.status} />
                      <button
                        type="button"
                        onClick={() => onSelectDocForInspector(doc)}
                        className="h-8 px-2.5 rounded border border-white/12 text-[12px] text-[#c7c4d8] hover:text-white hover:bg-white/5"
                      >
                        Open Scan
                      </button>
                      <button
                        type="button"
                        disabled={reExtractingId === doc.id}
                        onClick={async () => {
                          setReExtractingId(doc.id);
                          try {
                            await onReExtractDocument(doc);
                          } finally {
                            setReExtractingId(null);
                          }
                        }}
                        className="h-8 px-2.5 rounded border border-white/12 text-[12px] text-[#c7c4d8] hover:text-white hover:bg-white/5 flex items-center gap-1.5"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${reExtractingId === doc.id ? "animate-spin" : ""}`}
                        />
                        <span>Re-extract</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApproveDocument(doc.id)}
                        className="h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-medium flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Record</span>
                      </button>
                    </div>
                  </div>

                  {/* Risk Explanations */}
                  {doc.riskFlags.length > 0 && (
                    <div className="px-4 py-2.5 border-b border-white/8 bg-[#0b0f19]/60 space-y-1.5">
                      {doc.riskFlags.map((flag, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-[12px] text-[#c7c4d8]"
                        >
                          {flag.severity === "high" ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-[#f87171] mt-0.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24] mt-0.5 shrink-0" />
                          )}
                          <span>
                            <strong className="text-[#dae2fd] font-medium">{flag.clause}:</strong>{" "}
                            {flag.explanation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Field Verification Rows */}
                  <div className="divide-y divide-white/[0.06]">
                    {(flaggedFields.length > 0 ? flaggedFields : doc.fields.slice(0, 3)).map(
                      (field) => {
                        const compositeKey = `${doc.id}:${field.key}`;
                        const val = draftValues[compositeKey] ?? field.value;
                        return (
                          <div
                            key={field.key}
                            className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0 sm:w-56">
                              <div className="text-[12px] font-medium text-[#dae2fd]">
                                {field.label}
                              </div>
                              <div className="text-[11px] font-mono tabular-nums text-[#fbbf24]">
                                {field.key} · {field.confidence.toFixed(1)}% confidence
                              </div>
                            </div>

                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={val}
                                onChange={(e) =>
                                  setDraftValues((prev) => ({
                                    ...prev,
                                    [compositeKey]: e.target.value,
                                  }))
                                }
                                className="flex-1 h-8 px-2.5 rounded bg-[#0b0f19] border border-white/12 focus:border-[#4f46e5] focus:outline-none font-mono text-[12px] text-[#dae2fd]"
                              />
                              <button
                                type="button"
                                onClick={() => handleVerifyField(doc.id, field.key, field.value)}
                                className="h-8 px-3 rounded bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-medium whitespace-nowrap"
                              >
                                Verify Value
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
