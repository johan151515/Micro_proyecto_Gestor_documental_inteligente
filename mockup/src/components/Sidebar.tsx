import {
  AlertCircle,
  Braces,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { DocumentFolder, WorkspaceView } from "../types/documind";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  activeFolder: DocumentFolder;
  onSelectFolder: (folder: DocumentFolder) => void;
  counts: {
    total: number;
    exceptions: number;
    processing: number;
    schemas: number;
    folders: Record<Exclude<DocumentFolder, "all">, number>;
  };
}

const NAV_ITEMS: Array<{
  id: WorkspaceView;
  label: string;
  Icon: typeof FileText;
  badgeKey?: "exceptions" | "processing" | "schemas";
}> = [
  { id: "registry", label: "Document Registry", Icon: Layers },
  { id: "pipelines", label: "OCR Queue & Pipelines", Icon: Workflow, badgeKey: "processing" },
  { id: "audit", label: "Audit & Exceptions", Icon: AlertCircle, badgeKey: "exceptions" },
  { id: "schemas", label: "Schema Templates", Icon: Braces, badgeKey: "schemas" },
  { id: "synthesis", label: "Narrative Synthesis", Icon: Sparkles },
];

const FOLDERS: Array<{
  id: Exclude<DocumentFolder, "all">;
  label: string;
  Icon: typeof Scale;
}> = [
  { id: "Legal Contracts", label: "Legal Contracts", Icon: Scale },
  { id: "Financial Statements", label: "Financial Statements", Icon: FileSpreadsheet },
  { id: "Vendor Invoices", label: "Vendor Invoices", Icon: FileText },
  { id: "Compliance Filings", label: "Compliance Filings", Icon: ShieldCheck },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  activeView,
  onSelectView,
  activeFolder,
  onSelectFolder,
  counts,
}: SidebarProps) {
  return (
    <aside
      className={`h-full bg-[#0b0f19] border-r border-white/8 flex flex-col justify-between shrink-0 transition-[width] duration-150 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex flex-col min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-13 px-3.5 border-b border-white/8 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onSelectView("registry");
              onSelectFolder("all");
            }}
            className="flex items-center gap-2.5 text-left min-w-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4f46e5] rounded"
            title="DocuMind Enterprise"
          >
            <div className="w-7 h-7 rounded bg-[#4f46e5] border border-white/20 flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 2.5H10L13 5.5V13.5H3V2.5Z" stroke="white" strokeWidth="1.4" />
                <path d="M5.5 7.5H10.5M5.5 10H9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-[14px] font-semibold tracking-tight text-[#dae2fd] whitespace-nowrap truncate">
                DocuMind
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-6 h-6 rounded flex items-center justify-center text-[#918fa1] hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Workspace Navigation */}
        <div className="p-2.5">
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[11px] font-medium text-[#64748b] tracking-wide">
              Workspace
            </div>
          )}
          <nav className="space-y-0.5" aria-label="Primary workspace views">
            {NAV_ITEMS.map(({ id, label, Icon, badgeKey }) => {
              const isActive = activeView === id;
              const badgeVal = badgeKey ? counts[badgeKey] : 0;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectView(id)}
                  title={collapsed ? label : undefined}
                  className={`w-full h-8 px-2.5 rounded flex items-center justify-between gap-2 text-[13px] transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#4f46e5]/18 text-[#dae2fd] font-medium border border-[#4f46e5]/40"
                      : "text-[#94a3b8] hover:text-[#dae2fd] hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#c3c0ff]" : "text-[#64748b]"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </span>
                  {!collapsed && badgeVal > 0 && (
                    <span
                      className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                        badgeKey === "exceptions"
                          ? "bg-amber-500/12 text-[#fbbf24]"
                          : "bg-white/5 text-[#94a3b8]"
                      }`}
                    >
                      {badgeVal}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Repository Tree */}
        <div className="px-2.5 pt-2 pb-4 border-t border-white/6">
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[11px] font-medium text-[#64748b] tracking-wide">
              Repositories
            </div>
          )}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onSelectFolder("all");
                if (activeView !== "registry" && activeView !== "audit") {
                  onSelectView("registry");
                }
              }}
              title={collapsed ? "All Documents" : undefined}
              className={`w-full h-8 px-2.5 rounded flex items-center justify-between gap-2 text-[13px] transition-colors whitespace-nowrap ${
                activeFolder === "all" && (activeView === "registry" || activeView === "audit")
                  ? "bg-white/[0.06] text-[#dae2fd] font-medium"
                  : "text-[#94a3b8] hover:text-[#dae2fd] hover:bg-white/[0.03]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                {activeFolder === "all" ? (
                  <FolderOpen className="w-4 h-4 shrink-0 text-[#c3c0ff]" />
                ) : (
                  <Folder className="w-4 h-4 shrink-0 text-[#64748b]" />
                )}
                {!collapsed && <span className="truncate">All Repositories</span>}
              </span>
              {!collapsed && (
                <span className="font-mono tabular-nums text-[11px] text-[#64748b]">
                  {counts.total}
                </span>
              )}
            </button>

            {FOLDERS.map(({ id, label, Icon }) => {
              const isSelected = activeFolder === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelectFolder(id);
                    if (activeView !== "registry" && activeView !== "audit") {
                      onSelectView("registry");
                    }
                  }}
                  title={collapsed ? label : undefined}
                  className={`w-full h-8 px-2.5 rounded flex items-center justify-between gap-2 text-[13px] transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-white/[0.06] text-[#dae2fd] font-medium"
                      : "text-[#94a3b8] hover:text-[#dae2fd] hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#c3c0ff]" : "text-[#64748b]"}`} />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </span>
                  {!collapsed && (
                    <span className="font-mono tabular-nums text-[11px] text-[#64748b]">
                      {counts.folders[id] || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviewer Account Footer */}
      <div className="p-3 border-t border-white/8 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-[#1e293b] border border-white/12 flex items-center justify-center text-[11px] font-semibold text-[#c3c0ff] shrink-0">
            ER
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[#dae2fd] truncate">Elena Rostova</div>
              <div className="text-[11px] text-[#64748b] truncate">Lead Document Auditor</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
