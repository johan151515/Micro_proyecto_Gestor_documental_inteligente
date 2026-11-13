import { useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Play,
  Upload,
  XCircle,
} from "lucide-react";
import { SAMPLE_INGEST_PRESETS } from "../data/seedDocuments";
import { DocumentFolder, EnterpriseDocument, PipelineJob, SchemaTemplate } from "../types/documind";

interface PipelineQueueViewProps {
  schemas: SchemaTemplate[];
  jobs: PipelineJob[];
  onRunExtraction: (payload: {
    title: string;
    fileName: string;
    folder: Exclude<DocumentFolder, "all">;
    schemaId: string;
    textContent?: string;
    imageBase64?: string;
    mimeType?: string;
    uploadedImageDataUrl?: string;
  }) => Promise<EnterpriseDocument | null>;
  onInspectDocument: (docId: string) => void;
}

const PIPELINE_STAGES = [
  { id: "ingestion", label: "01. Ingestion & SHA-256" },
  { id: "ocr_layout", label: "02. Layout & OCR Pass" },
  { id: "entity_extraction", label: "03. AI Entity Extraction" },
  { id: "schema_validation", label: "04. Schema & Risk Audit" },
  { id: "completed", label: "05. Registry Commit" },
] as const;

export function PipelineQueueView({
  schemas,
  jobs,
  onRunExtraction,
  onInspectDocument,
}: PipelineQueueViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [schemaId, setSchemaId] = useState(schemas[0]?.id || "sch-msa-v3");
  const [textContent, setTextContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    mimeType: string;
    base64?: string;
    dataUrl?: string;
    text?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedSchema = schemas.find((s) => s.id === schemaId) || schemas[0];

  const handleFilePicked = (file: File) => {
    setErrorMsg(null);
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    if (!title) setTitle(baseName);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        const base64 = dataUrl.split(",")[1] || "";
        setUploadedFile({
          name: file.name,
          mimeType: file.type,
          base64,
          dataUrl,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const txt = String(reader.result || "");
        setTextContent(txt);
        setUploadedFile({
          name: file.name,
          mimeType: file.type || "text/plain",
          text: txt,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!textContent.trim() && !uploadedFile?.base64) {
      setErrorMsg("Upload a document image/text file or paste document text to parse.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const doc = await onRunExtraction({
        title: title.trim() || uploadedFile?.name || "Untitled Enterprise Document",
        fileName: uploadedFile?.name || `${(title || "document").toLowerCase().replace(/\s+/g, "_")}.txt`,
        folder: selectedSchema.folder,
        schemaId: selectedSchema.id,
        textContent: textContent.trim() || undefined,
        imageBase64: uploadedFile?.base64,
        mimeType: uploadedFile?.mimeType,
        uploadedImageDataUrl: uploadedFile?.dataUrl,
      });

      if (doc) {
        setTitle("");
        setTextContent("");
        setUploadedFile(null);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Pipeline execution failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunSample = async (presetId: string) => {
    const preset = SAMPLE_INGEST_PRESETS.find((p) => p.id === presetId);
    if (!preset || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onRunExtraction({
        title: preset.title,
        fileName: preset.fileName,
        folder: preset.folder,
        schemaId: preset.schemaId,
        textContent: preset.rawText,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Sample extraction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const latestJob = jobs[0];

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#dae2fd] tracking-tight">
              OCR Queue &amp; Extraction Pipeline
            </h2>
            <p className="text-[13px] text-[#94a3b8] mt-1">
              Ingest scanned document images or structured text payloads through Gemini multimodal OCR and schema validation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {SAMPLE_INGEST_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={submitting}
                onClick={() => handleRunSample(preset.id)}
                className="h-8 px-3 rounded border border-white/12 text-[12px] text-[#c7c4d8] hover:text-white hover:bg-white/5 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Play className="w-3 h-3 text-[#c3c0ff]" />
                <span>Run Sample: {preset.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live 5-Stage Pipeline Stepper */}
        <div className="rounded-lg border border-white/8 bg-[#131b2e] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold text-[#dae2fd]">
              Active Pipeline Stage
            </span>
            <span className="text-[11px] font-mono text-[#94a3b8]">
              {latestJob ? `${latestJob.title} · ${latestJob.stage}` : "Idle — Ready for ingestion"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {PIPELINE_STAGES.map((st, idx) => {
              const stageOrder = PIPELINE_STAGES.findIndex((s) => s.id === latestJob?.stage);
              const isCompleted = latestJob && (latestJob.stage === "completed" || idx < stageOrder);
              const isCurrent = latestJob && latestJob.stage === st.id && latestJob.stage !== "completed";
              const isFailed = latestJob?.stage === "failed" && idx === 2;

              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded border text-[12px] flex items-center gap-2 ${
                    isFailed
                      ? "bg-rose-500/10 border-rose-500/30 text-[#f87171]"
                      : isCurrent
                        ? "bg-[#4f46e5]/18 border-[#4f46e5] text-[#dae2fd]"
                        : isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/25 text-[#34d399]"
                          : "bg-[#0b0f19] border-white/8 text-[#64748b]"
                  }`}
                >
                  {isFailed ? (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-[#c3c0ff]" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current shrink-0 opacity-40" />
                  )}
                  <span className="truncate font-medium">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ingestion Form + Dropzone */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-lg border border-white/8 bg-[#131b2e] p-5"
        >
          <div className="lg:col-span-5 space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFilePicked(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`h-52 rounded-lg border border-dashed flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#4f46e5] bg-[#4f46e5]/10"
                  : "border-white/15 bg-[#0b0f19] hover:border-white/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFilePicked(file);
                }}
              />
              <Upload className="w-6 h-6 text-[#c3c0ff] mb-2" />
              <div className="text-[13px] font-medium text-[#dae2fd]">
                {uploadedFile ? uploadedFile.name : "Drop scanned image or text document"}
              </div>
              <p className="text-[11px] text-[#64748b] mt-1">
                Supports PNG, JPG, WEBP scans or TXT, MD, CSV, JSON records
              </p>
            </div>

            {uploadedFile?.dataUrl && (
              <div className="rounded border border-white/10 overflow-hidden bg-[#0b0f19] p-2">
                <img
                  src={uploadedFile.dataUrl}
                  alt={uploadedFile.name}
                  referrerPolicy="no-referrer"
                  className="max-h-36 mx-auto object-contain rounded"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Meridian Cloud MSA 2026"
                  className="w-full h-9 px-3 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[13px] text-[#dae2fd]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">
                  Target Extraction Schema
                </label>
                <select
                  value={schemaId}
                  onChange={(e) => setSchemaId(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[13px] text-[#dae2fd]"
                >
                  {schemas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (v{s.version})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">
                Raw Document Text / OCR Transcript (optional when uploading an image)
              </label>
              <textarea
                rows={5}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste contract clauses, invoice line items, or financial balance sheet text here..."
                className="w-full p-3 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none font-mono text-[12px] text-[#dae2fd] placeholder:text-[#64748b]"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/25 text-[12px] text-[#f87171]">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#64748b]">
                Extracts {selectedSchema.fields.length} schema keys · Threshold {selectedSchema.confidenceThreshold}%
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white text-[13px] font-medium flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{submitting ? "Running AI Extraction..." : "Execute Pipeline"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Pipeline Execution Log */}
        <div className="rounded-lg border border-white/8 bg-[#131b2e] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[#dae2fd]">Recent Pipeline Jobs</h3>
            <span className="text-[11px] font-mono tabular-nums text-[#64748b]">
              {jobs.length} runs recorded
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-[#94a3b8]">
              No new pipeline runs initiated in this session yet. Upload a document or click a sample preset above.
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#0f172a] border-b border-white/8 text-[10px] font-mono uppercase text-[#64748b]">
                <tr className="h-8">
                  <th className="px-4 font-medium">Job ID</th>
                  <th className="px-4 font-medium">Document</th>
                  <th className="px-4 font-medium">Schema</th>
                  <th className="px-4 font-medium">Stage</th>
                  <th className="px-4 font-medium text-right">Duration</th>
                  <th className="px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-[12px]">
                {jobs.map((job) => (
                  <tr key={job.id} className="h-10 hover:bg-white/[0.02]">
                    <td className="px-4 font-mono text-[#94a3b8]">{job.id}</td>
                    <td className="px-4 font-medium text-[#dae2fd]">{job.title}</td>
                    <td className="px-4 text-[#94a3b8]">{job.schemaName}</td>
                    <td className="px-4 font-mono text-[11px]">
                      {job.stage === "completed" ? (
                        <span className="text-[#34d399]">Completed</span>
                      ) : job.stage === "failed" ? (
                        <span className="text-[#f87171]">Failed</span>
                      ) : (
                        <span className="text-[#60a5fa]">{job.stage}</span>
                      )}
                    </td>
                    <td className="px-4 text-right font-mono tabular-nums text-[#94a3b8]">
                      {job.durationMs ? `${(job.durationMs / 1000).toFixed(2)}s` : "—"}
                    </td>
                    <td className="px-4 text-right">
                      {job.stage === "completed" && (
                        <button
                          type="button"
                          onClick={() => onInspectDocument(job.documentId)}
                          className="text-[11px] font-medium text-[#c3c0ff] hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
