import { useMemo, useState } from "react";
import { ArrowUpDown, Check, Download, FilePlus2, Search, X } from "lucide-react";
import { DocumentStatus, EnterpriseDocument, SchemaTemplate } from "../types/documind";
import { StatusIndicator } from "./StatusIndicator";

interface RegistryViewProps {
  documents: EnterpriseDocument[];
  schemas: SchemaTemplate[];
  selectedDocId: string | null;
  onSelectDoc: (doc: EnterpriseDocument) => void;
  onBulkApprove: (docIds: string[]) => void;
  onOpenIngestModal: () => void;
}

type SortKey = "ingestedAt" | "confidence" | "pages" | "title";

export function RegistryView({
  documents,
  schemas,
  selectedDocId,
  onSelectDoc,
  onBulkApprove,
  onOpenIngestModal,
}: RegistryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [schemaFilter, setSchemaFilter] = useState<string>("all");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("ingestedAt");
  const [sortAsc, setSortAsc] = useState(false);

  const metrics = useMemo(() => {
    const total = documents.length;
    const validated = documents.filter((d) => d.status === "validated").length;
    const exceptions = documents.filter((d) => d.status === "warning" || d.status === "failed").length;
    const avgConf =
      total > 0 ? documents.reduce((acc, d) => acc + d.confidence, 0) / total : 0;
    const totalTokens = documents.reduce((acc, d) => acc + d.tokensUsed, 0);
    return { total, validated, exceptions, avgConf, totalTokens };
  }, [documents]);

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents
      .filter((doc) => {
        if (statusFilter !== "all" && doc.status !== statusFilter) return false;
        if (schemaFilter !== "all" && doc.schemaId !== schemaFilter) return false;
        if (!q) return true;
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.id.toLowerCase().includes(q) ||
          doc.fileName.toLowerCase().includes(q) ||
          doc.sha256Prefix.toLowerCase().includes(q) ||
          doc.schemaName.toLowerCase().includes(q) ||
          doc.owner.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "confidence") cmp = a.confidence - b.confidence;
        else if (sortKey === "pages") cmp = a.pages - b.pages;
        else if (sortKey === "title") cmp = a.title.localeCompare(b.title);
        else cmp = a.ingestedAt.localeCompare(b.ingestedAt);
        return sortAsc ? cmp : -cmp;
      });
  }, [documents, searchQuery, statusFilter, schemaFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCheckAll = () => {
    if (checkedIds.size === filteredDocs.length && filteredDocs.length > 0) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredDocs.map((d) => d.id)));
    }
  };

  const handleExportCsv = () => {
    const targetDocs =
      checkedIds.size > 0
        ? filteredDocs.filter((d) => checkedIds.has(d.id))
        : filteredDocs;

    const header = ["ID", "Title", "Repository", "Schema", "Status", "Confidence", "Pages", "SHA256", "IngestedAt"];
    const rows = targetDocs.map((d) => [
      d.id,
      `"${d.title.replace(/"/g, '""')}"`,
      d.folder,
      `"${d.schemaName}"`,
      d.status,
      d.confidence.toFixed(1),
      String(d.pages),
      d.sha256Prefix,
      d.ingestedAt,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = "documind_registry_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0f172a]">
      {/* Compact 4-Column Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/8 bg-[#0b1326] shrink-0 divide-x divide-white/8">
        <div className="px-4 py-3">
          <div className="text-[11px] font-medium text-[#64748b]">Documents Indexed</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold font-mono tabular-nums text-[#dae2fd]">
              {metrics.total}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-[#34d399]">
              {metrics.validated} verified
            </span>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-[11px] font-medium text-[#64748b]">Mean OCR Confidence</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold font-mono tabular-nums text-[#dae2fd]">
              {metrics.avgConf.toFixed(1)}%
            </span>
            <span className="text-[11px] text-[#94a3b8]">across schema fields</span>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-[11px] font-medium text-[#64748b]">Audit Exceptions</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-[20px] font-semibold font-mono tabular-nums ${
                metrics.exceptions > 0 ? "text-[#fbbf24]" : "text-[#34d399]"
              }`}
            >
              {metrics.exceptions}
            </span>
            <span className="text-[11px] text-[#94a3b8]">requiring review</span>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-[11px] font-medium text-[#64748b]">Tokens Synthesized</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold font-mono tabular-nums text-[#dae2fd]">
              {(metrics.totalTokens / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-[#94a3b8]">parsed corpus</span>
          </div>
        </div>
      </div>

      {/* Filter & Bulk Toolbar */}
      <div className="px-4 py-2.5 border-b border-white/8 bg-[#0f172a] flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, hash, ID, or owner..."
              className="h-8 w-64 pl-8 pr-7 rounded bg-[#0b0f19] border border-white/10 focus:border-[#4f46e5] focus:outline-none text-[12px] text-[#dae2fd] placeholder:text-[#64748b]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented Status Filter */}
          <div className="flex items-center p-0.5 rounded bg-[#0b0f19] border border-white/8">
            {(
              [
                { id: "all", label: "All" },
                { id: "validated", label: "Validated" },
                { id: "warning", label: "Review" },
                { id: "failed", label: "Failed" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={`h-6 px-2.5 rounded-xs text-[11px] font-medium transition-colors whitespace-nowrap ${
                  statusFilter === opt.id
                    ? "bg-[#1e293b] text-[#dae2fd]"
                    : "text-[#94a3b8] hover:text-[#dae2fd]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={schemaFilter}
            onChange={(e) => setSchemaFilter(e.target.value)}
            aria-label="Filter by schema template"
            className="h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 text-[12px] text-[#c7c4d8] focus:border-[#4f46e5] focus:outline-none"
          >
            <option value="all">All Schemas</option>
            {schemas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {checkedIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                onBulkApprove(Array.from(checkedIds));
                setCheckedIds(new Set());
              }}
              className="h-8 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve ({checkedIds.size})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="h-8 px-2.5 rounded border border-white/12 text-[#94a3b8] hover:text-white hover:bg-white/5 text-[12px] font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-Density Registry Table */}
      <div className="flex-1 overflow-auto">
        {filteredDocs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="text-[14px] font-semibold text-[#dae2fd]">
              No matching documents in registry
            </div>
            <p className="mt-1 text-[12px] text-[#94a3b8] max-w-sm">
              Adjust your search terms or status filter, or ingest a new document into the extraction pipeline.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSchemaFilter("all");
                }}
                className="h-8 px-3 rounded border border-white/12 text-[12px] text-[#c7c4d8] hover:text-white hover:bg-white/5"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onOpenIngestModal}
                className="h-8 px-3 rounded bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-medium flex items-center gap-1.5"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Ingest Document</span>
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#0f172a] border-b border-white/8">
              <tr className="h-8 text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                <th className="w-9 px-3">
                  <input
                    type="checkbox"
                    checked={checkedIds.size === filteredDocs.length && filteredDocs.length > 0}
                    onChange={toggleCheckAll}
                    aria-label="Select all documents"
                    className="w-3.5 h-3.5 rounded-xs accent-[#4f46e5] cursor-pointer"
                  />
                </th>
                <th className="px-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("title")}
                    className="inline-flex items-center gap-1 hover:text-[#dae2fd]"
                  >
                    <span>Document</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-3 font-medium hidden xl:table-cell">Schema</th>
                <th className="px-3 font-medium">Status</th>
                <th className="px-3 font-medium text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("confidence")}
                    className="inline-flex items-center gap-1 hover:text-[#dae2fd]"
                  >
                    <span>OCR Conf</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-3 font-medium text-right hidden md:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort("pages")}
                    className="inline-flex items-center gap-1 hover:text-[#dae2fd]"
                  >
                    <span>Pages</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-3 font-medium hidden lg:table-cell">Hash</th>
                <th className="px-3 font-medium text-right hidden sm:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort("ingestedAt")}
                    className="inline-flex items-center gap-1 hover:text-[#dae2fd]"
                  >
                    <span>Ingested</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const isChecked = checkedIds.has(doc.id);
                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    className={`h-11 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#4f46e5]/14"
                        : "hover:bg-white/[0.025]"
                    }`}
                  >
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(doc.id)}
                        aria-label={`Select ${doc.title}`}
                        className="w-3.5 h-3.5 rounded-xs accent-[#4f46e5] cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-1.5 min-w-[200px] max-w-[320px]">
                      <div className="text-[13px] font-medium text-[#dae2fd] truncate">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-[#64748b] flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[#918fa1]">{doc.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.folder}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.owner}</span>
                      </div>
                    </td>
                    <td className="px-3 text-[12px] text-[#94a3b8] hidden xl:table-cell whitespace-nowrap">
                      {doc.schemaName}
                    </td>
                    <td className="px-3 whitespace-nowrap">
                      <StatusIndicator status={doc.status} compact />
                    </td>
                    <td className="px-3 text-right font-mono tabular-nums text-[12px] whitespace-nowrap">
                      <span
                        className={
                          doc.confidence >= 94
                            ? "text-[#34d399]"
                            : doc.confidence >= 80
                              ? "text-[#fbbf24]"
                              : "text-[#f87171]"
                        }
                      >
                        {doc.confidence.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 text-right font-mono tabular-nums text-[12px] text-[#94a3b8] hidden md:table-cell">
                      {doc.pages}
                    </td>
                    <td className="px-3 font-mono text-[11px] text-[#64748b] hidden lg:table-cell whitespace-nowrap">
                      {doc.sha256Prefix}
                    </td>
                    <td className="px-3 text-right font-mono tabular-nums text-[11px] text-[#94a3b8] hidden sm:table-cell whitespace-nowrap">
                      {doc.ingestedAt.replace(" UTC", "")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
