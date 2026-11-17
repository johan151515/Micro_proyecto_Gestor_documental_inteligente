import { useEffect, useMemo, useState } from "react";
import { INITIAL_DOCUMENTS, INITIAL_SCHEMAS } from "./data/seedDocuments";
import {
  DocumentFolder,
  EnterpriseDocument,
  ExtractedField,
  PipelineJob,
  SchemaTemplate,
  SynthesisReport,
  WorkspaceView,
} from "./types/documind";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { RegistryView } from "./components/RegistryView";
import { InspectorPanel } from "./components/InspectorPanel";
import { PipelineQueueView } from "./components/PipelineQueueView";
import { SchemasView } from "./components/SchemasView";
import { AuditExceptionsView } from "./components/AuditExceptionsView";
import { SynthesisView } from "./components/SynthesisView";
import { CommandPalette } from "./components/CommandPalette";
import { IngestModal } from "./components/IngestModal";

function generateShaPrefix(seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0") + "a4f2";
}

export default function App() {
  const [documents, setDocuments] = useState<EnterpriseDocument[]>(INITIAL_DOCUMENTS);
  const [schemas, setSchemas] = useState<SchemaTemplate[]>(INITIAL_SCHEMAS);
  const [jobs, setJobs] = useState<PipelineJob[]>([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<WorkspaceView>("registry");
  const [activeFolder, setActiveFolder] = useState<DocumentFolder>("all");

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    INITIAL_DOCUMENTS[0]?.id ?? null
  );
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorWidth, setInspectorWidth] = useState(480);

  const [commandOpen, setCommandOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [extractingDocId, setExtractingDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const folderFilteredDocuments = useMemo(() => {
    if (activeFolder === "all") return documents;
    return documents.filter((d) => d.folder === activeFolder);
  }, [documents, activeFolder]);

  const selectedDocument = useMemo(
    () => documents.find((d) => d.id === selectedDocId) ?? null,
    [documents, selectedDocId]
  );

  const counts = useMemo(() => {
    const folders: Record<Exclude<DocumentFolder, "all">, number> = {
      "Legal Contracts": 0,
      "Financial Statements": 0,
      "Vendor Invoices": 0,
      "Compliance Filings": 0,
    };
    let exceptions = 0;
    let processing = 0;
    for (const d of documents) {
      folders[d.folder] = (folders[d.folder] || 0) + 1;
      if (d.status === "warning" || d.status === "failed") exceptions += 1;
      if (d.status === "processing") processing += 1;
    }
    return {
      total: documents.length,
      exceptions,
      processing,
      schemas: schemas.length,
      folders,
    };
  }, [documents, schemas]);

  const handleUpdateField = (docId: string, fieldKey: string, newValue: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const updatedFields: ExtractedField[] = doc.fields.map((f) =>
          f.key === fieldKey
            ? {
                ...f,
                value: newValue,
                confidence: 100.0,
                status: "validated",
                verifiedByHuman: true,
              }
            : f
        );
        const avgConf =
          updatedFields.reduce((acc, f) => acc + f.confidence, 0) /
          Math.max(1, updatedFields.length);
        const anyWarning = updatedFields.some((f) => f.status === "warning");

        return {
          ...doc,
          fields: updatedFields,
          confidence: avgConf,
          status: anyWarning ? "warning" : "validated",
        };
      })
    );
    showToast("success", `Verified field "${fieldKey}" on ${docId}.`);
  };

  const handleApproveDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          status: "validated",
          confidence: Math.max(doc.confidence, 98.5),
          fields: doc.fields.map((f) => ({
            ...f,
            status: "validated",
            verifiedByHuman: f.status === "warning" ? true : f.verifiedByHuman,
            confidence: f.status === "warning" ? 99.0 : f.confidence,
          })),
        };
      })
    );
    showToast("success", `${docId} approved and committed as Validated.`);
  };

  const handleBulkApprove = (docIds: string[]) => {
    const idSet = new Set(docIds);
    setDocuments((prev) =>
      prev.map((doc) =>
        idSet.has(doc.id)
          ? {
              ...doc,
              status: "validated",
              fields: doc.fields.map((f) => ({ ...f, status: "validated" })),
            }
          : doc
      )
    );
    showToast("success", `Approved ${docIds.length} document(s).`);
  };

  const handleRunExtraction = async (payload: {
    title: string;
    fileName: string;
    folder: Exclude<DocumentFolder, "all">;
    schemaId: string;
    textContent?: string;
    imageBase64?: string;
    mimeType?: string;
    uploadedImageDataUrl?: string;
  }): Promise<EnterpriseDocument | null> => {
    const schema = schemas.find((s) => s.id === payload.schemaId) || schemas[0];
    const newDocId = `DOC-${8842 + documents.length}`;
    const jobId = `JOB-${1040 + jobs.length}`;
    const startedMs = Date.now();

    const newJob: PipelineJob = {
      id: jobId,
      documentId: newDocId,
      title: payload.title,
      schemaName: schema.name,
      stage: "entity_extraction",
      progress: 55,
      startedAt: new Date().toISOString().slice(11, 19) + " UTC",
    };
    setJobs((prev) => [newJob, ...prev]);

    const res = await fetch("/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        schemaName: schema.name,
        schemaFields: schema.fields,
        textContent: payload.textContent,
        imageBase64: payload.imageBase64,
        mimeType: payload.mimeType,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, stage: "failed", error: data.error || "Extraction failed" }
            : j
        )
      );
      throw new Error(data.error || "Failed to extract document via Gemini API.");
    }

    const fields: ExtractedField[] = (data.fields || []).map(
      (f: ExtractedField, idx: number) => ({
        key: f.key || `field_${idx + 1}`,
        label: f.label || f.key || `Field ${idx + 1}`,
        value: String(f.value ?? ""),
        confidence: Number(f.confidence ?? 95),
        status:
          f.status === "warning" || Number(f.confidence) < schema.confidenceThreshold
            ? "warning"
            : "validated",
        page: Number(f.page || 1),
        bbox: f.bbox || { x: 8, y: 18 + idx * 11, w: 48, h: 7 },
      })
    );

    const overallConfidence = Number(data.overallConfidence ?? 95);
    const hasWarning =
      overallConfidence < schema.confidenceThreshold ||
      fields.some((f) => f.status === "warning");

    const createdDoc: EnterpriseDocument = {
      id: newDocId,
      title: payload.title,
      fileName: payload.fileName,
      folder: payload.folder,
      schemaId: schema.id,
      schemaName: schema.name,
      status: hasWarning ? "warning" : "validated",
      confidence: overallConfidence,
      pages: 1,
      tokensUsed: Math.max(850, (payload.textContent?.length || 1200) * 2),
      sha256Prefix: generateShaPrefix(payload.title + Date.now()),
      ingestedAt: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      owner: "Elena Rostova",
      summary: data.summary || "Document parsed and schema fields extracted.",
      rawText: data.ocrTranscript || payload.textContent || payload.title,
      uploadedImageDataUrl: payload.uploadedImageDataUrl,
      documentKind: payload.uploadedImageDataUrl ? "uploaded" : "contract",
      documentHeaderMeta: {
        issuer: payload.title,
        refCode: newDocId,
        dateLabel: "Ingested Live",
      },
      fields,
      riskFlags: data.riskFlags || [],
    };

    setDocuments((prev) => [createdDoc, ...prev]);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              stage: "completed",
              progress: 100,
              durationMs: Date.now() - startedMs,
            }
          : j
      )
    );
    setSelectedDocId(createdDoc.id);
    setInspectorOpen(true);
    setActiveView("registry");
    showToast("success", `Extracted ${fields.length} schema fields for ${createdDoc.id}.`);
    return createdDoc;
  };

  const handleReExtractDocument = async (doc: EnterpriseDocument) => {
    const schema = schemas.find((s) => s.id === doc.schemaId) || schemas[0];
    setExtractingDocId(doc.id);
    try {
      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: doc.title,
          schemaName: schema.name,
          schemaFields: schema.fields,
          textContent: doc.rawText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Re-extraction failed.");
      }

      const updatedFields: ExtractedField[] = (data.fields || []).map(
        (f: ExtractedField, idx: number) => ({
          key: f.key,
          label: f.label,
          value: String(f.value ?? ""),
          confidence: Number(f.confidence ?? 96),
          status:
            f.status === "warning" || Number(f.confidence) < schema.confidenceThreshold
              ? "warning"
              : "validated",
          page: Number(f.page || 1),
          bbox: doc.fields[idx]?.bbox || f.bbox || { x: 8, y: 20 + idx * 10, w: 46, h: 6 },
        })
      );

      const overall = Number(data.overallConfidence ?? doc.confidence);
      const anyWarning =
        overall < schema.confidenceThreshold ||
        updatedFields.some((f) => f.status === "warning");

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                confidence: overall,
                status: anyWarning ? "warning" : "validated",
                summary: data.summary || d.summary,
                fields: updatedFields.length > 0 ? updatedFields : d.fields,
                riskFlags: data.riskFlags || d.riskFlags,
              }
            : d
        )
      );
      showToast("success", `Re-ran AI extraction for ${doc.id}.`);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Re-extraction failed.");
    } finally {
      setExtractingDocId(null);
    }
  };

  const handleAskQuestion = async (doc: EnterpriseDocument, question: string) => {
    const res = await fetch("/api/documents/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document: {
          title: doc.title,
          schemaName: doc.schemaName,
          summary: doc.summary,
          rawText: doc.rawText,
          fields: doc.fields,
        },
        question,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("error", data.error || "Unable to answer question.");
      return;
    }

    const answer = data.answer || "No answer returned.";
    const timestamp = new Date().toISOString().slice(11, 16) + " UTC";
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              qaHistory: [{ question, answer, timestamp }, ...(d.qaHistory || [])],
            }
          : d
      )
    );
  };

  const handleSynthesize = async (
    selectedDocs: EnterpriseDocument[],
    mode: string,
    customPrompt?: string
  ): Promise<SynthesisReport> => {
    const res = await fetch("/api/documents/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documents: selectedDocs.map((d) => ({
          id: d.id,
          title: d.title,
          schemaName: d.schemaName,
          confidence: d.confidence,
          summary: d.summary,
          fields: d.fields,
        })),
        mode,
        customPrompt,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Synthesis request failed.");
    }
    return {
      headline: data.headline || "Cross-Document Synthesis Report",
      executiveBrief: data.executiveBrief || "",
      keyFindings: data.keyFindings || [],
      recommendedActions: data.recommendedActions || [],
      generatedAt: new Date().toISOString().slice(11, 16) + " UTC",
      documentIds: selectedDocs.map((d) => d.id),
    };
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0b0f19] text-[#dae2fd]">
      {/* Left Navigation Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activeView={activeView}
        onSelectView={setActiveView}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        counts={counts}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          activeView={activeView}
          activeFolder={activeFolder}
          inspectorOpen={inspectorOpen}
          showInspectorToggle={activeView === "registry"}
          onToggleInspector={() => setInspectorOpen((o) => !o)}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenIngestModal={() => setIngestOpen(true)}
        />

        {/* Active View + Split Inspector */}
        <main className="flex-1 flex min-h-0 overflow-hidden relative">
          {activeView === "registry" && (
            <>
              <RegistryView
                documents={folderFilteredDocuments}
                schemas={schemas}
                selectedDocId={selectedDocId}
                onSelectDoc={(doc) => {
                  setSelectedDocId(doc.id);
                  setInspectorOpen(true);
                }}
                onBulkApprove={handleBulkApprove}
                onOpenIngestModal={() => setIngestOpen(true)}
              />

              {inspectorOpen && (
                <InspectorPanel
                  document={selectedDocument}
                  width={inspectorWidth}
                  onResizeWidth={setInspectorWidth}
                  onClose={() => setInspectorOpen(false)}
                  onUpdateField={handleUpdateField}
                  onApproveDocument={handleApproveDocument}
                  onReExtractDocument={handleReExtractDocument}
                  onAskQuestion={handleAskQuestion}
                  isExtracting={extractingDocId === selectedDocument?.id}
                />
              )}
            </>
          )}

          {activeView === "pipelines" && (
            <PipelineQueueView
              schemas={schemas}
              jobs={jobs}
              onRunExtraction={handleRunExtraction}
              onInspectDocument={(docId) => {
                setSelectedDocId(docId);
                setInspectorOpen(true);
                setActiveView("registry");
              }}
            />
          )}

          {activeView === "schemas" && (
            <SchemasView
              schemas={schemas}
              onUpdateThreshold={(schemaId, threshold) =>
                setSchemas((prev) =>
                  prev.map((s) =>
                    s.id === schemaId ? { ...s, confidenceThreshold: threshold } : s
                  )
                )
              }
              onAddSchema={(created) => {
                setSchemas((prev) => [created, ...prev]);
                showToast("success", `Schema "${created.name}" saved.`);
              }}
            />
          )}

          {activeView === "audit" && (
            <AuditExceptionsView
              documents={folderFilteredDocuments}
              onSelectDocForInspector={(doc) => {
                setSelectedDocId(doc.id);
                setInspectorOpen(true);
                setActiveView("registry");
              }}
              onUpdateField={handleUpdateField}
              onApproveDocument={handleApproveDocument}
              onReExtractDocument={handleReExtractDocument}
            />
          )}

          {activeView === "synthesis" && (
            <SynthesisView documents={documents} onSynthesize={handleSynthesize} />
          )}

          {/* Non-intrusive Action Toast */}
          {toast && (
            <div
              role="status"
              className={`fixed bottom-4 right-4 z-40 px-3.5 py-2.5 rounded-lg border text-[12px] font-medium shadow-xl ${
                toast.type === "error"
                  ? "bg-[#1e293b] border-rose-500/40 text-[#ffb4ab]"
                  : "bg-[#1e293b] border-emerald-500/35 text-[#6ffbbe]"
              }`}
            >
              {toast.message}
            </div>
          )}
        </main>
      </div>

      {/* Cmd+K Command Palette */}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        documents={documents}
        schemas={schemas}
        onSelectDocument={(doc) => {
          setSelectedDocId(doc.id);
          setInspectorOpen(true);
          setActiveView("registry");
        }}
        onNavigateView={setActiveView}
      />

      {/* Quick Ingest Modal */}
      <IngestModal
        open={ingestOpen}
        onClose={() => setIngestOpen(false)}
        schemas={schemas}
        onRunExtraction={handleRunExtraction}
      />
    </div>
  );
}
