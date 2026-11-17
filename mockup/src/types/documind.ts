export type DocumentStatus = "validated" | "processing" | "warning" | "failed";

export type DocumentFolder =
  | "all"
  | "Legal Contracts"
  | "Financial Statements"
  | "Vendor Invoices"
  | "Compliance Filings";

export type WorkspaceView =
  | "registry"
  | "pipelines"
  | "schemas"
  | "audit"
  | "synthesis";

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0 - 100
  status: "validated" | "warning";
  page: number;
  bbox: BoundingBox;
  verifiedByHuman?: boolean;
}

export interface RiskFlag {
  severity: "low" | "medium" | "high";
  clause: string;
  explanation: string;
}

export interface DocumentSectionBlock {
  heading?: string;
  lines: Array<{
    text: string;
    fieldKey?: string;
    align?: "left" | "right";
    mono?: boolean;
    bold?: boolean;
  }>;
}

export interface EnterpriseDocument {
  id: string;
  title: string;
  fileName: string;
  folder: Exclude<DocumentFolder, "all">;
  schemaId: string;
  schemaName: string;
  status: DocumentStatus;
  confidence: number;
  pages: number;
  tokensUsed: number;
  sha256Prefix: string;
  ingestedAt: string;
  owner: string;
  summary: string;
  rawText: string;
  uploadedImageDataUrl?: string;
  documentKind: "contract" | "invoice" | "financial" | "compliance" | "uploaded";
  documentHeaderMeta: {
    issuer: string;
    refCode: string;
    dateLabel: string;
  };
  fields: ExtractedField[];
  riskFlags: RiskFlag[];
  qaHistory?: Array<{ question: string; answer: string; timestamp: string }>;
}

export interface SchemaFieldDef {
  key: string;
  label: string;
  type: "string" | "currency" | "date" | "percentage" | "identifier";
  required: boolean;
}

export interface SchemaTemplate {
  id: string;
  name: string;
  folder: Exclude<DocumentFolder, "all">;
  version: string;
  confidenceThreshold: number;
  documentCount: number;
  avgAccuracy: number;
  description: string;
  fields: SchemaFieldDef[];
}

export interface PipelineJob {
  id: string;
  documentId: string;
  title: string;
  schemaName: string;
  stage: "ingestion" | "ocr_layout" | "entity_extraction" | "schema_validation" | "completed" | "failed";
  progress: number;
  startedAt: string;
  durationMs?: number;
  error?: string;
}

export interface SynthesisReport {
  headline: string;
  executiveBrief: string;
  keyFindings: Array<{
    title: string;
    detail: string;
    severity: "low" | "medium" | "high";
    sourceDocs: string[];
  }>;
  recommendedActions: string[];
  generatedAt: string;
  documentIds: string[];
}
