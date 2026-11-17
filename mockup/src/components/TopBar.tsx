import { ChevronRight, Command, PanelRightClose, PanelRightOpen, Plus, Search } from "lucide-react";
import { DocumentFolder, WorkspaceView } from "../types/documind";

interface TopBarProps {
  activeView: WorkspaceView;
  activeFolder: DocumentFolder;
  inspectorOpen: boolean;
  onToggleInspector?: () => void;
  showInspectorToggle: boolean;
  onOpenCommandPalette: () => void;
  onOpenIngestModal: () => void;
}

const VIEW_TITLES: Record<WorkspaceView, string> = {
  registry: "Document Registry",
  pipelines: "OCR Queue & Pipelines",
  schemas: "Schema Templates",
  audit: "Audit & Exceptions",
  synthesis: "Narrative Synthesis",
};

export function TopBar({
  activeView,
  activeFolder,
  inspectorOpen,
  onToggleInspector,
  showInspectorToggle,
  onOpenCommandPalette,
  onOpenIngestModal,
}: TopBarProps) {
  return (
    <header className="h-13 px-4 md:px-5 bg-[#0f172a] border-b border-white/8 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Contextual Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] min-w-0">
        <span className="text-[#64748b] whitespace-nowrap shrink-0">Enterprise Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#464555] shrink-0" />
        {activeFolder !== "all" && (activeView === "registry" || activeView === "audit") && (
          <>
            <span className="text-[#94a3b8] whitespace-nowrap truncate max-w-[160px]">
              {activeFolder}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#464555] shrink-0" />
          </>
        )}
        <h1 className="text-[#dae2fd] font-semibold whitespace-nowrap truncate">
          {VIEW_TITLES[activeView]}
        </h1>
      </div>

      {/* Zone 2 & 3: Quick Command Search + Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 hover:border-white/20 text-[12px] text-[#94a3b8] hover:text-[#dae2fd] flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <Search className="w-3.5 h-3.5 text-[#64748b]" />
          <span className="hidden sm:inline">Search documents &amp; schemas</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#171f33] text-[#918fa1] rounded border border-white/8">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {showInspectorToggle && onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={inspectorOpen ? "Hide document inspector" : "Show document inspector"}
            className="h-8 px-2.5 rounded border border-white/12 text-[#94a3b8] hover:text-white hover:bg-white/5 flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0"
          >
            {inspectorOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
            <span className="hidden lg:inline">Inspector</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenIngestModal}
          className="h-8 px-3 rounded bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-medium border-t border-white/20 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Document</span>
        </button>
      </div>
    </header>
  );
}
