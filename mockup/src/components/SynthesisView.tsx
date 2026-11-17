import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { EnterpriseDocument, SynthesisReport } from "../types/documind";
import { StatusIndicator } from "./StatusIndicator";

interface SynthesisViewProps {
  documents: EnterpriseDocument[];
  onSynthesize: (
    selectedDocs: EnterpriseDocument[],
    mode: string,
    customPrompt?: string
  ) => Promise<SynthesisReport>;
}

export function SynthesisView({ documents, onSynthesize }: SynthesisViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(documents.filter((d) => d.status === "validated").slice(0, 3).map((d) => d.id))
  );
  const [mode, setMode] = useState<"executive" | "discrepancy" | "financial">("executive");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<SynthesisReport | null>(null);

  const toggleDoc = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = documents.filter((d) => selectedIds.has(d.id));
    if (chosen.length === 0) {
      setErrorMsg("Select at least one document to synthesize.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await onSynthesize(chosen, mode, customPrompt);
      setReport(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to synthesize narrative.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="border-b border-white/8 pb-4">
          <h2 className="text-[20px] font-semibold text-[#dae2fd] tracking-tight">
            Cross-Document Narrative Synthesis
          </h2>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Select indexed documents to synthesize executive briefings, contractual liability comparisons, and discrepancy audits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Document Selector Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#dae2fd]">
                Source Corpus ({selectedIds.size} selected)
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(documents.map((d) => d.id)))}
                className="text-[11px] text-[#c3c0ff] hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="rounded-lg border border-white/8 bg-[#131b2e] divide-y divide-white/[0.06] max-h-[480px] overflow-y-auto">
              {documents.map((doc) => {
                const checked = selectedIds.has(doc.id);
                return (
                  <label
                    key={doc.id}
                    className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                      checked ? "bg-[#4f46e5]/10" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDoc(doc.id)}
                      className="mt-1 w-3.5 h-3.5 rounded-xs accent-[#4f46e5] cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-medium text-[#dae2fd] truncate">
                          {doc.title}
                        </span>
                        <StatusIndicator status={doc.status} compact />
                      </div>
                      <div className="mt-1 text-[11px] font-mono tabular-nums text-[#64748b] flex items-center gap-2">
                        <span>{doc.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.schemaName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.confidence.toFixed(1)}%</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Synthesis Controls & Output */}
          <div className="lg:col-span-7 space-y-4">
            <form
              onSubmit={handleGenerate}
              className="rounded-lg border border-white/8 bg-[#131b2e] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-[#dae2fd]">Synthesis Directive</span>
                <div className="flex items-center p-0.5 rounded bg-[#0b0f19] border border-white/8">
                  {(
                    [
                      { id: "executive", label: "Executive Brief" },
                      { id: "discrepancy", label: "Discrepancy Audit" },
                      { id: "financial", label: "Financial Rollup" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMode(opt.id)}
                      className={`h-6 px-2.5 rounded-xs text-[11px] font-medium transition-colors whitespace-nowrap ${
                        mode === opt.id
                          ? "bg-[#1e293b] text-[#dae2fd]"
                          : "text-[#94a3b8] hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Optional custom instruction (e.g., Compare liability caps and notice periods across all selected contracts)..."
                className="w-full p-2.5 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[12px] text-[#dae2fd] placeholder:text-[#64748b]"
              />

              {errorMsg && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/25 text-[12px] text-[#f87171]">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748b]">
                  Grounded strictly in verified schema fields &amp; transcripts
                </span>
                <button
                  type="submit"
                  disabled={loading || selectedIds.size === 0}
                  className="h-9 px-4 rounded bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white text-[12px] font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{loading ? "Synthesizing..." : "Generate Synthesis"}</span>
                </button>
              </div>
            </form>

            {report ? (
              <div className="rounded-lg border border-white/10 bg-[#131b2e] p-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3">
                  <div>
                    <div className="text-[11px] font-mono text-[#c3c0ff]">
                      Synthesis Report · {report.documentIds.length} Documents
                    </div>
                    <h3 className="text-[17px] font-semibold text-[#dae2fd] mt-0.5">
                      {report.headline}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-[#64748b] shrink-0">
                    {report.generatedAt}
                  </span>
                </div>

                <p className="text-[13px] leading-relaxed text-[#c7c4d8] whitespace-pre-wrap">
                  {report.executiveBrief}
                </p>

                <div className="space-y-2">
                  <div className="text-[12px] font-semibold text-[#dae2fd]">
                    Key Findings &amp; Cross-References
                  </div>
                  <div className="space-y-2">
                    {report.keyFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded bg-[#0b0f19] border border-white/8 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-[#dae2fd] flex items-center gap-1.5">
                            {finding.severity === "high" || finding.severity === "medium" ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                            )}
                            <span>{finding.title}</span>
                          </span>
                          <span className="font-mono text-[10px] uppercase text-[#94a3b8]">
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#c7c4d8] leading-relaxed">
                          {finding.detail}
                        </p>
                        {finding.sourceDocs.length > 0 && (
                          <div className="text-[11px] font-mono text-[#64748b] pt-0.5">
                            Sources: {finding.sourceDocs.join(" · ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {report.recommendedActions.length > 0 && (
                  <div className="pt-2 border-t border-white/8 space-y-1.5">
                    <div className="text-[12px] font-semibold text-[#dae2fd]">
                      Recommended Audit Actions
                    </div>
                    <ul className="space-y-1">
                      {report.recommendedActions.map((act, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[12px] text-[#c7c4d8]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#34d399] mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-white/8 bg-[#131b2e]/50 p-8 text-center">
                <Sparkles className="w-6 h-6 text-[#c3c0ff] mx-auto mb-2 opacity-80" />
                <div className="text-[14px] font-medium text-[#dae2fd]">
                  Ready to Synthesize Selected Corpus
                </div>
                <p className="text-[12px] text-[#94a3b8] mt-1 max-w-md mx-auto">
                  Select two or more documents on the left and click Generate Synthesis to produce an AI-grounded cross-document audit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
