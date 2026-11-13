import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Braces, FileText, Layers, Search, Sparkles, Workflow } from "lucide-react";
import { EnterpriseDocument, SchemaTemplate, WorkspaceView } from "../types/documind";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  documents: EnterpriseDocument[];
  schemas: SchemaTemplate[];
  onSelectDocument: (doc: EnterpriseDocument) => void;
  onNavigateView: (view: WorkspaceView) => void;
}

export function CommandPalette({
  open,
  onClose,
  documents,
  schemas,
  onSelectDocument,
  onNavigateView,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const navResults: Array<{
      id: string;
      group: "Navigation" | "Documents" | "Schemas";
      title: string;
      subtitle: string;
      action: () => void;
    }> = [
      {
        id: "nav-registry",
        group: "Navigation",
        title: "Document Registry",
        subtitle: "Open 3-pane document registry workbench",
        action: () => onNavigateView("registry"),
      },
      {
        id: "nav-pipelines",
        group: "Navigation",
        title: "OCR Queue & Pipelines",
        subtitle: "Ingest and parse new documents",
        action: () => onNavigateView("pipelines"),
      },
      {
        id: "nav-audit",
        group: "Navigation",
        title: "Audit & Exceptions",
        subtitle: "Review low-confidence OCR fields",
        action: () => onNavigateView("audit"),
      },
      {
        id: "nav-schemas",
        group: "Navigation",
        title: "Schema Templates",
        subtitle: "Configure extraction contracts",
        action: () => onNavigateView("schemas"),
      },
      {
        id: "nav-synthesis",
        group: "Navigation",
        title: "Narrative Synthesis",
        subtitle: "Cross-document AI audit report",
        action: () => onNavigateView("synthesis"),
      },
    ];

    const docResults = documents.map((d) => ({
      id: d.id,
      group: "Documents" as const,
      title: d.title,
      subtitle: `${d.id} · ${d.schemaName} · ${d.confidence.toFixed(1)}% OCR`,
      action: () => onSelectDocument(d),
    }));

    const schemaResults = schemas.map((s) => ({
      id: s.id,
      group: "Schemas" as const,
      title: s.name,
      subtitle: `v${s.version} · ${s.fields.length} fields · ${s.folder}`,
      action: () => onNavigateView("schemas"),
    }));

    const combined = [...docResults, ...navResults, ...schemaResults];
    if (!q) return combined.slice(0, 10);
    return combined
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query, documents, schemas, onNavigateView, onSelectDocument]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0b0f19]/80 backdrop-blur-sm flex items-start justify-center pt-[12vh] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-lg bg-[#1e293b] border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 px-4 border-b border-white/10 flex items-center gap-3 bg-[#131b2e]">
          <Search className="w-4 h-4 text-[#94a3b8] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && items[0]) {
                items[0].action();
                onClose();
              }
            }}
            placeholder="Jump to document, SHA-256 hash, schema, or view..."
            autoFocus
            className="flex-1 bg-transparent text-[13px] text-[#dae2fd] placeholder:text-[#64748b] focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#0b0f19] text-[#94a3b8] rounded border border-white/10">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04] p-1.5">
          {items.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-[#94a3b8]">
              No matching documents or commands found.
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="w-full px-3 py-2 rounded flex items-center justify-between gap-3 text-left hover:bg-[#4f46e5]/20 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.group === "Documents" ? (
                    <FileText className="w-4 h-4 text-[#c3c0ff] shrink-0" />
                  ) : item.group === "Schemas" ? (
                    <Braces className="w-4 h-4 text-[#34d399] shrink-0" />
                  ) : item.id === "nav-synthesis" ? (
                    <Sparkles className="w-4 h-4 text-[#60a5fa] shrink-0" />
                  ) : item.id === "nav-pipelines" ? (
                    <Workflow className="w-4 h-4 text-[#60a5fa] shrink-0" />
                  ) : (
                    <Layers className="w-4 h-4 text-[#94a3b8] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#dae2fd] truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-[#94a3b8] truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-white shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
