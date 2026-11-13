import { useState } from "react";
import { Braces, Plus, X } from "lucide-react";
import { DocumentFolder, SchemaFieldDef, SchemaTemplate } from "../types/documind";

interface SchemasViewProps {
  schemas: SchemaTemplate[];
  onUpdateThreshold: (schemaId: string, threshold: number) => void;
  onAddSchema: (schema: SchemaTemplate) => void;
}

export function SchemasView({ schemas, onUpdateThreshold, onAddSchema }: SchemasViewProps) {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(schemas[0]?.id || "");
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newFolder, setNewFolder] = useState<Exclude<DocumentFolder, "all">>("Legal Contracts");
  const [newDesc, setNewDesc] = useState("");
  const [newFieldsRaw, setNewFieldsRaw] = useState(
    "counterparty_name:Counterparty Name:string\ncontract_value:Contract Value:currency\neffective_date:Effective Date:date"
  );

  const activeSchema = schemas.find((s) => s.id === selectedSchemaId) || schemas[0];

  const handleCreateSchema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const parsedFields: SchemaFieldDef[] = newFieldsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, label, type] = line.split(":");
        return {
          key: (key || "field_key").trim().toLowerCase().replace(/\s+/g, "_"),
          label: (label || key || "Extracted Field").trim(),
          type: (["string", "currency", "date", "percentage", "identifier"].includes(type?.trim() || "")
            ? type.trim()
            : "string") as SchemaFieldDef["type"],
          required: true,
        };
      });

    const created: SchemaTemplate = {
      id: `sch-${Date.now().toString().slice(-5)}`,
      name: newName.trim(),
      folder: newFolder,
      version: "1.0",
      confidenceThreshold: 92.0,
      documentCount: 0,
      avgAccuracy: 96.0,
      description: newDesc.trim() || "Custom enterprise extraction schema.",
      fields: parsedFields,
    };

    onAddSchema(created);
    setSelectedSchemaId(created.id);
    setCreating(false);
    setNewName("");
    setNewDesc("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-end justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#dae2fd] tracking-tight">
              Extraction Schema Templates
            </h2>
            <p className="text-[13px] text-[#94a3b8] mt-1">
              Define typed JSON extraction contracts and minimum OCR confidence thresholds for human-in-the-loop routing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="h-9 px-3.5 rounded bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Schema</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Schema List */}
          <div className="lg:col-span-5 space-y-2.5">
            {schemas.map((schema) => {
              const selected = schema.id === activeSchema?.id;
              return (
                <button
                  key={schema.id}
                  type="button"
                  onClick={() => setSelectedSchemaId(schema.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors ${
                    selected
                      ? "bg-[#4f46e5]/14 border-[#4f46e5]"
                      : "bg-[#131b2e] border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-[#dae2fd] truncate">
                      {schema.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#c3c0ff] shrink-0">
                      v{schema.version}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#94a3b8] mt-1 line-clamp-2">
                    {schema.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono tabular-nums text-[#64748b]">
                    <span>{schema.folder}</span>
                    <span aria-hidden="true">·</span>
                    <span>{schema.fields.length} fields</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#34d399]">{schema.avgAccuracy.toFixed(1)}% accuracy</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Schema Field Contract */}
          {activeSchema && (
            <div className="lg:col-span-7 rounded-lg border border-white/8 bg-[#131b2e] p-5 space-y-4 self-start">
              <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Braces className="w-4 h-4 text-[#c3c0ff]" />
                    <h3 className="text-[16px] font-semibold text-[#dae2fd]">{activeSchema.name}</h3>
                  </div>
                  <p className="text-[12px] text-[#94a3b8] mt-1">{activeSchema.description}</p>
                </div>
                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-[11px] text-[#64748b]">Auto-Approve Threshold</div>
                  <div className="text-[16px] font-semibold text-[#c3c0ff]">
                    {activeSchema.confidenceThreshold.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-[#94a3b8]">Minimum Field Confidence Gate</span>
                  <span className="font-mono tabular-nums text-[#dae2fd]">
                    {activeSchema.confidenceThreshold.toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={99}
                  step={1}
                  value={activeSchema.confidenceThreshold}
                  onChange={(e) => onUpdateThreshold(activeSchema.id, Number(e.target.value))}
                  className="w-full accent-[#4f46e5] cursor-pointer"
                />
              </div>

              <div className="rounded border border-white/8 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#0f172a] border-b border-white/8 text-[10px] font-mono uppercase text-[#64748b]">
                    <tr className="h-8">
                      <th className="px-3 font-medium">Key</th>
                      <th className="px-3 font-medium">Display Label</th>
                      <th className="px-3 font-medium">Type</th>
                      <th className="px-3 font-medium text-right">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] text-[12px] bg-[#0b0f19]">
                    {activeSchema.fields.map((field) => (
                      <tr key={field.key} className="h-9">
                        <td className="px-3 font-mono text-[#c3c0ff]">{field.key}</td>
                        <td className="px-3 text-[#dae2fd]">{field.label}</td>
                        <td className="px-3 font-mono text-[#94a3b8]">{field.type}</td>
                        <td className="px-3 text-right font-mono text-[11px]">
                          {field.required ? (
                            <span className="text-[#34d399]">Required</span>
                          ) : (
                            <span className="text-[#64748b]">Optional</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Schema Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-[#0b0f19]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSchema}
            className="w-full max-w-lg rounded-lg bg-[#1e293b] border border-white/12 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#dae2fd]">Create Schema Template</h3>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#94a3b8] mb-1">Schema Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Commercial Lease"
                  className="w-full h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 text-[12px] text-white focus:border-[#4f46e5] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#94a3b8] mb-1">Target Repository</label>
                <select
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value as Exclude<DocumentFolder, "all">)}
                  className="w-full h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 text-[12px] text-white focus:border-[#4f46e5] focus:outline-none"
                >
                  <option value="Legal Contracts">Legal Contracts</option>
                  <option value="Financial Statements">Financial Statements</option>
                  <option value="Vendor Invoices">Vendor Invoices</option>
                  <option value="Compliance Filings">Compliance Filings</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#94a3b8] mb-1">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief purpose of this extraction schema"
                className="w-full h-8 px-2.5 rounded bg-[#0b0f19] border border-white/10 text-[12px] text-white focus:border-[#4f46e5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#94a3b8] mb-1">
                Field Definitions (key:Label:type per line)
              </label>
              <textarea
                rows={4}
                value={newFieldsRaw}
                onChange={(e) => setNewFieldsRaw(e.target.value)}
                className="w-full p-2.5 rounded bg-[#0b0f19] border border-white/10 font-mono text-[11px] text-white focus:border-[#4f46e5] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="h-8 px-3 rounded border border-white/12 text-[12px] text-[#94a3b8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 px-3.5 rounded bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-medium"
              >
                Save Schema
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
