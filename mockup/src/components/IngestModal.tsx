import { useRef, useState } from "react";
import { Loader2, Play, Upload, X } from "lucide-react";
import { SAMPLE_INGEST_PRESETS } from "../data/seedDocuments";
import { DocumentFolder, EnterpriseDocument, SchemaTemplate } from "../types/documind";

interface IngestModalProps {
  open: boolean;
  onClose: () => void;
  schemas: SchemaTemplate[];
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
}

export function IngestModal({
  open,
  onClose,
  schemas,
  onRunExtraction,
}: IngestModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [schemaId, setSchemaId] = useState(schemas[0]?.id || "sch-msa-v3");
  const [textContent, setTextContent] = useState("");
  const [imagePayload, setImagePayload] = useState<{
    name: string;
    mimeType: string;
    base64: string;
    dataUrl: string;
  } | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const selectedSchema = schemas.find((s) => s.id === schemaId) || schemas[0];

  const handleFile = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " "));
    }
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setImagePayload({
          name: file.name,
          mimeType: file.type,
          base64: dataUrl.split(",")[1] || "",
          dataUrl,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setTextContent(String(reader.result || ""));
        setImagePayload(null);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim() && !imagePayload) {
      setErrorMsg("Attach an image/document file or paste document text.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await onRunExtraction({
        title: title.trim() || fileName || "Ingested Enterprise Document",
        fileName: fileName || "ingested_document.txt",
        folder: selectedSchema.folder,
        schemaId: selectedSchema.id,
        textContent: textContent.trim() || undefined,
        imageBase64: imagePayload?.base64,
        mimeType: imagePayload?.mimeType,
        uploadedImageDataUrl: imagePayload?.dataUrl,
      });
      setTitle("");
      setTextContent("");
      setImagePayload(null);
      setFileName("");
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0b0f19]/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-lg bg-[#1e293b] border border-white/15 shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-white/10 bg-[#131b2e] flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#dae2fd]">
            Ingest Document for OCR &amp; AI Extraction
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-[#94a3b8]">Quick Load Sample:</span>
            {SAMPLE_INGEST_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setTitle(preset.title);
                  setFileName(preset.fileName);
                  setSchemaId(preset.schemaId);
                  setTextContent(preset.rawText);
                  setImagePayload(null);
                }}
                className="h-6 px-2 rounded bg-[#0b0f19] border border-white/10 hover:border-[#4f46e5] text-[11px] text-[#c3c0ff]"
              >
                {preset.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#94a3b8] mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Horizon BioTech MSA"
                className="w-full h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[12px] text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#94a3b8] mb-1">Extraction Schema</label>
              <select
                value={schemaId}
                onChange={(e) => setSchemaId(e.target.value)}
                className="w-full h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[12px] text-white"
              >
                {schemas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="p-3 rounded border border-dashed border-white/15 bg-[#0b0f19] hover:border-white/30 flex items-center justify-between cursor-pointer"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="flex items-center gap-2.5 text-[12px] text-[#c7c4d8]">
              <Upload className="w-4 h-4 text-[#c3c0ff]" />
              <span>
                {imagePayload
                  ? `Image attached: ${imagePayload.name}`
                  : fileName
                    ? `Loaded: ${fileName}`
                    : "Upload scanned image (PNG/JPG) or text file"}
              </span>
            </div>
            <span className="text-[11px] text-[#64748b]">Browse</span>
          </div>

          <div>
            <label className="block text-[11px] text-[#94a3b8] mb-1">
              Document Text Content
            </label>
            <textarea
              rows={5}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste raw document text, invoice lines, or contract clauses..."
              className="w-full p-2.5 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none font-mono text-[11px] text-white"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/25 text-[12px] text-[#f87171]">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 bg-[#131b2e] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded border border-white/12 text-[12px] text-[#94a3b8] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-8 px-3.5 rounded bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white text-[12px] font-medium flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{loading ? "Extracting..." : "Run AI Extraction"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
