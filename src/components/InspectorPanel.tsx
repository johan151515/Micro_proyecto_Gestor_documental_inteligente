import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Edit3,
  Loader2,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { EnterpriseDocument, ExtractedField } from "../types/documind";
import { DocumentSheetPreview } from "./DocumentSheetPreview";
import { StatusIndicator } from "./StatusIndicator";

interface InspectorPanelProps {
  document: EnterpriseDocument | null;
  width: number;
  onResizeWidth: (newWidth: number) => void;
  onClose: () => void;
  onUpdateField: (docId: string, fieldKey: string, newValue: string) => void;
  onApproveDocument: (docId: string) => void;
  onReExtractDocument: (doc: EnterpriseDocument) => Promise<void>;
  onAskQuestion: (doc: EnterpriseDocument, question: string) => Promise<void>;
  isExtracting: boolean;
}

type InspectorTab = "ocr" | "json" | "synthesis";

export function InspectorPanel({
  document,
  width,
  onResizeWidth,
  onClose,
  onUpdateField,
  onApproveDocument,
  onReExtractDocument,
  onAskQuestion,
  isExtracting,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("ocr");
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string>("");
  const [copiedJson, setCopiedJson] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [askingAi, setAskingAi] = useState(false);

  useEffect(() => {
    setSelectedFieldKey(document?.fields[0]?.key ?? null);
    setEditingKey(null);
  }, [document?.id]);

  if (!document) {
    return (
      <aside
        style={{ width }}
        className="h-full bg-[#0f172a] border-l border-white/8 flex items-center justify-center p-6 text-center shrink-0"
      >
        <div className="max-w-xs space-y-2">
          <div className="text-[14px] font-semibold text-[#dae2fd]">No Document Selected</div>
          <p className="text-[12px] text-[#94a3b8]">
            Select any document row in the registry table to inspect OCR bounding boxes, schema keys, and AI synthesis.
          </p>
        </div>
      </aside>
    );
  }

  const handleStartDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const clamped = Math.min(640, Math.max(380, startWidth + delta));
      onResizeWidth(clamped);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const jsonPayload = {
    documentId: document.id,
    title: document.title,
    schema: document.schemaName,
    sha256Prefix: document.sha256Prefix,
    status: document.status,
    overallConfidence: Number(document.confidence.toFixed(2)),
    extractedFields: Object.fromEntries(
      document.fields.map((f) => [
        f.key,
        {
          value: f.value,
          confidence: Number(f.confidence.toFixed(1)),
          verifiedByHuman: Boolean(f.verifiedByHuman),
        },
      ])
    ),
  };

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(jsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.id.toLowerCase()}_extracted.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = (field: ExtractedField) => {
    if (draftValue.trim()) {
      onUpdateField(document.id, field.key, draftValue.trim());
    }
    setEditingKey(null);
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || askingAi) return;
    const q = questionInput.trim();
    setQuestionInput("");
    setAskingAi(true);
    try {
      await onAskQuestion(document, q);
    } finally {
      setAskingAi(false);
    }
  };

  return (
    <aside
      style={{ width }}
      className="relative h-full bg-[#0f172a] border-l border-white/8 flex flex-col shrink-0 min-w-[380px] max-w-[640px]"
    >
      {/* Left Resize Handle */}
      <div
        onMouseDown={handleStartDrag}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize inspector panel"
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#4f46e5]/60 transition-colors z-30"
      />

      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-white/8 bg-[#131b2e] space-y-2.5 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-[#94a3b8]">
              <span className="text-[#c3c0ff]">{document.id}</span>
              <span aria-hidden="true">·</span>
              <span>SHA256:{document.sha256Prefix}</span>
              <span aria-hidden="true">·</span>
              <span>{document.confidence.toFixed(1)}% OCR</span>
            </div>
            <h2 className="text-[15px] font-semibold text-[#dae2fd] truncate mt-0.5">
              {document.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="w-7 h-7 rounded flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/5 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <StatusIndicator status={document.status} />
            <span className="text-[11px] text-[#94a3b8] truncate max-w-[170px]">
              {document.schemaName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onReExtractDocument(document)}
              disabled={isExtracting}
              className="h-7 px-2.5 rounded border border-white/12 text-[11px] font-medium text-[#c7c4d8] hover:text-white hover:bg-white/5 disabled:opacity-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {isExtracting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span>{isExtracting ? "Extracting..." : "Re-run AI"}</span>
            </button>

            {document.status !== "validated" && (
              <button
                type="button"
                onClick={() => onApproveDocument(document.id)}
                className="h-7 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Check className="w-3 h-3" />
                <span>Approve</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inspector Tabs */}
      <div className="px-4 border-b border-white/8 bg-[#0f172a] flex items-center gap-4 shrink-0">
        {(
          [
            { id: "ocr", label: "OCR & Fields" },
            { id: "json", label: "JSON Schema" },
            { id: "synthesis", label: "AI Synthesis & Q&A" },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? "border-[#4f46e5] text-[#dae2fd]"
                  : "border-transparent text-[#94a3b8] hover:text-[#dae2fd]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "ocr" && (
          <>
            <DocumentSheetPreview
              document={document}
              selectedFieldKey={selectedFieldKey}
              onSelectField={(field) => setSelectedFieldKey(field.key)}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-semibold text-[#dae2fd]">
                  Extracted Schema Fields
                </h3>
                <span className="text-[11px] font-mono tabular-nums text-[#64748b]">
                  {document.fields.length} keys parsed
                </span>
              </div>

              <div className="rounded-lg border border-white/8 divide-y divide-white/6 bg-[#131b2e]">
                {document.fields.map((field) => {
                  const isSelected = selectedFieldKey === field.key;
                  const isEditing = editingKey === field.key;
                  const isWarn = field.status === "warning";

                  return (
                    <div
                      key={field.key}
                      onClick={() => setSelectedFieldKey(field.key)}
                      className={`p-2.5 transition-colors cursor-pointer ${
                        isSelected ? "bg-[#4f46e5]/12" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[12px] font-medium text-[#c7c4d8] truncate">
                            {field.label}
                          </span>
                          <span className="font-mono text-[10px] text-[#64748b] truncate">
                            {field.key}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {field.verifiedByHuman && (
                            <span className="text-[10px] font-mono text-[#34d399]">
                              Verified
                            </span>
                          )}
                          <span
                            className={`font-mono tabular-nums text-[11px] ${
                              isWarn ? "text-[#fbbf24]" : "text-[#34d399]"
                            }`}
                          >
                            {field.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {isEditing ? (
                        <div
                          className="mt-2 flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={draftValue}
                            onChange={(e) => setDraftValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(field);
                              if (e.key === "Escape") setEditingKey(null);
                            }}
                            autoFocus
                            className="flex-1 h-7 px-2 rounded bg-[#0b0f19] border border-[#4f46e5] text-[12px] font-mono text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(field)}
                            className="h-7 px-2 rounded bg-[#4f46e5] text-white text-[11px] font-medium"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingKey(null)}
                            className="h-7 px-2 rounded border border-white/12 text-[#94a3b8] text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="text-[13px] font-mono text-[#dae2fd] break-all">
                            {field.value}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingKey(field.key);
                              setDraftValue(field.value);
                            }}
                            aria-label={`Edit ${field.label}`}
                            className="p-1 rounded text-[#64748b] hover:text-white hover:bg-white/5 shrink-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "json" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[#94a3b8]">
                Normalized payload matching <span className="text-[#dae2fd]">{document.schemaName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="h-7 px-2.5 rounded border border-white/12 text-[11px] text-[#c7c4d8] hover:text-white hover:bg-white/5 flex items-center gap-1.5"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-[#34d399]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="h-7 px-2.5 rounded border border-white/12 text-[11px] text-[#c7c4d8] hover:text-white hover:bg-white/5 flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <pre className="p-3.5 rounded-lg bg-[#060e20] border border-white/8 font-mono text-[11px] leading-relaxed text-[#c3c0ff] overflow-x-auto">
              {JSON.stringify(jsonPayload, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === "synthesis" && (
          <div className="space-y-4">
            {/* Executive Summary */}
            <div className="p-3.5 rounded-lg bg-[#131b2e] border border-white/8 space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#dae2fd]">
                <Sparkles className="w-3.5 h-3.5 text-[#c3c0ff]" />
                <span>AI Narrative Synthesis</span>
              </div>
              <p className="text-[13px] leading-relaxed text-[#c7c4d8]">{document.summary}</p>
            </div>

            {/* Risk & Audit Flags */}
            <div className="space-y-2">
              <div className="text-[12px] font-semibold text-[#dae2fd]">
                Audit &amp; Clause Flags ({document.riskFlags.length})
              </div>
              {document.riskFlags.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-[12px] text-[#34d399] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>No schema discrepancies or compliance risk flags detected.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {document.riskFlags.map((flag, i) => (
                    <div
                      key={`${flag.clause}-${i}`}
                      className={`p-3 rounded-lg border text-[12px] space-y-1 ${
                        flag.severity === "high"
                          ? "bg-rose-500/10 border-rose-500/25 text-[#ffdad6]"
                          : flag.severity === "medium"
                            ? "bg-amber-500/10 border-amber-500/25 text-[#fde68a]"
                            : "bg-[#131b2e] border-white/10 text-[#c7c4d8]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-medium">
                        <span className="flex items-center gap-1.5">
                          {flag.severity === "high" ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-[#f87171]" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24]" />
                          )}
                          <span>{flag.clause}</span>
                        </span>
                        <span className="font-mono text-[10px] uppercase">{flag.severity}</span>
                      </div>
                      <p className="text-[12px] opacity-90 leading-relaxed">{flag.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grounded Reviewer Q&A */}
            <div className="pt-2 border-t border-white/8 space-y-2.5">
              <div className="text-[12px] font-semibold text-[#dae2fd]">
                Ask Document Auditor
              </div>

              <form onSubmit={handleAskSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Ask about liability caps, payment terms, dates..."
                  className="flex-1 h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[12px] text-[#dae2fd] placeholder:text-[#64748b]"
                />
                <button
                  type="submit"
                  disabled={askingAi || !questionInput.trim()}
                  className="h-8 px-3 rounded bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white text-[12px] font-medium flex items-center gap-1.5 shrink-0"
                >
                  {askingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Ask</span>
                </button>
              </form>

              {document.qaHistory && document.qaHistory.length > 0 && (
                <div className="space-y-2 pt-1">
                  {document.qaHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#131b2e] border border-white/8 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#94a3b8]">
                        <span className="font-medium text-[#c3c0ff]">{item.question}</span>
                        <span className="font-mono text-[10px] shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-[12px] text-[#dae2fd] leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
