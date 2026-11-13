import { EnterpriseDocument, SchemaTemplate } from "../types/documind";

export const INITIAL_SCHEMAS: SchemaTemplate[] = [
  {
    id: "sch-msa-v3",
    name: "Master Services Agreement",
    folder: "Legal Contracts",
    version: "3.2",
    confidenceThreshold: 92.0,
    documentCount: 4,
    avgAccuracy: 97.8,
    description: "Extracts contracting parties, governing law, liability caps, auto-renewal windows, and SLA commitments.",
    fields: [
      { key: "counterparty_name", label: "Counterparty Legal Entity", type: "string", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "contract_value", label: "Annual Contract Value", type: "currency", required: true },
      { key: "liability_cap", label: "Limitation of Liability Cap", type: "string", required: true },
      { key: "governing_law", label: "Governing Jurisdiction", type: "string", required: true },
      { key: "renewal_notice_days", label: "Renewal Notice Window", type: "string", required: false },
    ],
  },
  {
    id: "sch-inv-v2",
    name: "Commercial Vendor Invoice",
    folder: "Vendor Invoices",
    version: "2.4",
    confidenceThreshold: 95.0,
    documentCount: 3,
    avgAccuracy: 94.6,
    description: "Parses vendor tax IDs, PO references, line-item subtotals, VAT/tax rates, and Net payment terms.",
    fields: [
      { key: "vendor_name", label: "Vendor Name", type: "string", required: true },
      { key: "invoice_number", label: "Invoice Reference", type: "identifier", required: true },
      { key: "po_number", label: "Purchase Order ID", type: "identifier", required: true },
      { key: "subtotal_amount", label: "Subtotal (Pre-Tax)", type: "currency", required: true },
      { key: "total_due", label: "Total Amount Due", type: "currency", required: true },
      { key: "payment_terms", label: "Payment Terms", type: "string", required: true },
    ],
  },
  {
    id: "sch-fin-qtr",
    name: "Quarterly Balance Sheet",
    folder: "Financial Statements",
    version: "1.9",
    confidenceThreshold: 94.0,
    documentCount: 2,
    avgAccuracy: 98.5,
    description: "Normalizes GAAP cash equivalents, total current assets, short-term liabilities, and EBITDA figures.",
    fields: [
      { key: "reporting_entity", label: "Reporting Entity", type: "string", required: true },
      { key: "fiscal_period", label: "Fiscal Period End", type: "date", required: true },
      { key: "total_assets", label: "Total Assets", type: "currency", required: true },
      { key: "total_liabilities", label: "Total Liabilities", type: "currency", required: true },
      { key: "operating_ebitda", label: "Adjusted EBITDA", type: "currency", required: true },
      { key: "auditor_opinion", label: "Auditor Attestation", type: "string", required: false },
    ],
  },
  {
    id: "sch-soc2-type2",
    name: "SOC-2 Type II Compliance Report",
    folder: "Compliance Filings",
    version: "2.1",
    confidenceThreshold: 90.0,
    documentCount: 2,
    avgAccuracy: 91.4,
    description: "Verifies trust service criteria, audit window dates, exception counts, and CPA firm attestation.",
    fields: [
      { key: "service_org", label: "Service Organization", type: "string", required: true },
      { key: "audit_firm", label: "Independent CPA Firm", type: "string", required: true },
      { key: "audit_period", label: "Observation Window", type: "string", required: true },
      { key: "trust_criteria", label: "Trust Services Criteria", type: "string", required: true },
      { key: "exceptions_noted", label: "Control Exceptions Count", type: "string", required: true },
    ],
  },
];

export const INITIAL_DOCUMENTS: EnterpriseDocument[] = [
  {
    id: "DOC-8841",
    title: "Northstar Cloud Infrastructure MSA",
    fileName: "northstar_cloud_msa_2026_executed.pdf",
    folder: "Legal Contracts",
    schemaId: "sch-msa-v3",
    schemaName: "Master Services Agreement",
    status: "validated",
    confidence: 99.2,
    pages: 18,
    tokensUsed: 14820,
    sha256Prefix: "7f9a3e21b804",
    ingestedAt: "2026-11-13 05:42 UTC",
    owner: "Elena Rostova",
    documentKind: "contract",
    documentHeaderMeta: {
      issuer: "Northstar Cloud Systems Inc.",
      refCode: "MSA-2026-NS-041",
      dateLabel: "Executed Nov 04, 2026",
    },
    summary:
      "Fully executed 36-month Master Services Agreement with Northstar Cloud Systems Inc. committing $480,000 annually for dedicated Kubernetes and archival storage clusters. Liability is capped at 12 months of trailing fees with Delaware governing law and a 60-day non-renewal notice window.",
    rawText: `MASTER SERVICES AGREEMENT (REF: MSA-2026-NS-041)
This Master Services Agreement ("Agreement") is entered into as of November 4, 2026 ("Effective Date"), by and between Meridian Financial Holdings ("Customer") and Northstar Cloud Systems Inc., a Delaware corporation ("Provider").
1. COMMERCIAL COMMITMENT: Customer commits to an Annual Contract Value of $480,000.00 USD across three consecutive 12-month service terms.
2. LIMITATION OF LIABILITY: Neither party's aggregate liability shall exceed 12 months trailing fees paid prior to the claim event.
3. GOVERNING LAW: This Agreement shall be governed by the laws of the State of Delaware, excluding conflict of law principles.
4. TERM & RENEWAL: Automatically renews for 12-month periods unless either party delivers written notice at least 60 days prior to expiration.`,
    fields: [
      {
        key: "counterparty_name",
        label: "Counterparty Legal Entity",
        value: "Northstar Cloud Systems Inc.",
        confidence: 99.7,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 21, w: 46, h: 6 },
      },
      {
        key: "effective_date",
        label: "Effective Date",
        value: "2026-11-04",
        confidence: 99.4,
        status: "validated",
        page: 1,
        bbox: { x: 56, y: 21, w: 34, h: 6 },
      },
      {
        key: "contract_value",
        label: "Annual Contract Value",
        value: "$480,000.00",
        confidence: 99.8,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 36, w: 42, h: 7 },
      },
      {
        key: "liability_cap",
        label: "Limitation of Liability Cap",
        value: "12 months trailing fees",
        confidence: 98.6,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 50, w: 62, h: 7 },
      },
      {
        key: "governing_law",
        label: "Governing Jurisdiction",
        value: "State of Delaware",
        confidence: 99.5,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 64, w: 38, h: 6 },
      },
      {
        key: "renewal_notice_days",
        label: "Renewal Notice Window",
        value: "60 days prior to expiration",
        confidence: 98.2,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 78, w: 54, h: 6 },
      },
    ],
    riskFlags: [
      {
        severity: "low",
        clause: "Section 4 — Auto-Renewal",
        explanation: "60-day opt-out deadline falls on September 5, 2029; calendar reminder recommended.",
      },
    ],
  },
  {
    id: "DOC-8840",
    title: "Vanguard Logistics Invoice #INV-90412",
    fileName: "vanguard_freight_inv_90412_scan.pdf",
    folder: "Vendor Invoices",
    schemaId: "sch-inv-v2",
    schemaName: "Commercial Vendor Invoice",
    status: "warning",
    confidence: 86.4,
    pages: 2,
    tokensUsed: 3410,
    sha256Prefix: "c21d8a40e912",
    ingestedAt: "2026-11-13 05:19 UTC",
    owner: "Marcus Vance",
    documentKind: "invoice",
    documentHeaderMeta: {
      issuer: "Vanguard Global Logistics Ltd.",
      refCode: "INV-90412",
      dateLabel: "Issued Nov 11, 2026",
    },
    summary:
      "Scanned commercial freight invoice from Vanguard Global Logistics Ltd. totaling $38,490.00 against PO-2026-4418. Handwritten customs surcharge line item and skewed fax stamp lowered OCR confidence on the total due and PO identifier; human verification required before ERP settlement.",
    rawText: `COMMERCIAL INVOICE — VANGUARD GLOBAL LOGISTICS LTD.
Invoice Reference: INV-90412
Purchase Order ID: PO-2026-4418
Subtotal (Pre-Tax): $35,200.00
Customs & Fuel Surcharge (stamped adjustment): $3,290.00
Total Amount Due: $38,490.00
Payment Terms: Net 45 Days from Receipt`,
    fields: [
      {
        key: "vendor_name",
        label: "Vendor Name",
        value: "Vanguard Global Logistics Ltd.",
        confidence: 98.9,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 18, w: 52, h: 6 },
      },
      {
        key: "invoice_number",
        label: "Invoice Reference",
        value: "INV-90412",
        confidence: 97.6,
        status: "validated",
        page: 1,
        bbox: { x: 64, y: 18, w: 28, h: 6 },
      },
      {
        key: "po_number",
        label: "Purchase Order ID",
        value: "PO-2026-4418",
        confidence: 74.2,
        status: "warning",
        page: 1,
        bbox: { x: 8, y: 31, w: 36, h: 6 },
      },
      {
        key: "subtotal_amount",
        label: "Subtotal (Pre-Tax)",
        value: "$35,200.00",
        confidence: 96.4,
        status: "validated",
        page: 1,
        bbox: { x: 54, y: 52, w: 36, h: 7 },
      },
      {
        key: "total_due",
        label: "Total Amount Due",
        value: "$38,490.00",
        confidence: 68.5,
        status: "warning",
        page: 1,
        bbox: { x: 54, y: 69, w: 36, h: 8 },
      },
      {
        key: "payment_terms",
        label: "Payment Terms",
        value: "Net 45 Days",
        confidence: 94.8,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 82, w: 34, h: 6 },
      },
    ],
    riskFlags: [
      {
        severity: "high",
        clause: "Total Due & Stamp Overlap",
        explanation: "Red customs stamp overlaps digit '8' in $38,490.00 (68.5% confidence). Verify against PO-2026-4418.",
      },
      {
        severity: "medium",
        clause: "PO Number Smudge",
        explanation: "Trailing digit '8' in PO-2026-4418 has low contrast on thermal scan.",
      },
    ],
  },
  {
    id: "DOC-8839",
    title: "Q3 2026 Consolidated Balance Sheet",
    fileName: "meridian_q3_2026_balance_sheet_gaap.pdf",
    folder: "Financial Statements",
    schemaId: "sch-fin-qtr",
    schemaName: "Quarterly Balance Sheet",
    status: "validated",
    confidence: 99.6,
    pages: 12,
    tokensUsed: 11240,
    sha256Prefix: "09b41fc73a55",
    ingestedAt: "2026-11-13 04:55 UTC",
    owner: "Priya Nair",
    documentKind: "financial",
    documentHeaderMeta: {
      issuer: "Meridian Financial Holdings Corp.",
      refCode: "FIN-Q3-2026-GAAP",
      dateLabel: "Period Ended Sep 30, 2026",
    },
    summary:
      "Unaudited Q3 2026 GAAP consolidated balance sheet for Meridian Financial Holdings Corp. Total assets stand at $142,850,000 against $58,410,000 in total liabilities, with quarterly Adjusted EBITDA of $19,640,000 and an unqualified review attestation from Deloitte & Touche LLP.",
    rawText: `CONSOLIDATED BALANCE SHEET — MERIDIAN FINANCIAL HOLDINGS CORP.
Fiscal Period End: September 30, 2026 (Q3 FY2026)
Total Assets: $142,850,000
Total Liabilities: $58,410,000
Adjusted EBITDA (Q3): $19,640,000
Auditor Attestation: Unqualified Review Opinion — Deloitte & Touche LLP`,
    fields: [
      {
        key: "reporting_entity",
        label: "Reporting Entity",
        value: "Meridian Financial Holdings Corp.",
        confidence: 99.9,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 17, w: 56, h: 6 },
      },
      {
        key: "fiscal_period",
        label: "Fiscal Period End",
        value: "2026-09-30",
        confidence: 99.8,
        status: "validated",
        page: 1,
        bbox: { x: 66, y: 17, w: 26, h: 6 },
      },
      {
        key: "total_assets",
        label: "Total Assets",
        value: "$142,850,000",
        confidence: 99.7,
        status: "validated",
        page: 1,
        bbox: { x: 52, y: 36, w: 38, h: 7 },
      },
      {
        key: "total_liabilities",
        label: "Total Liabilities",
        value: "$58,410,000",
        confidence: 99.5,
        status: "validated",
        page: 1,
        bbox: { x: 52, y: 50, w: 38, h: 7 },
      },
      {
        key: "operating_ebitda",
        label: "Adjusted EBITDA",
        value: "$19,640,000",
        confidence: 99.4,
        status: "validated",
        page: 1,
        bbox: { x: 52, y: 65, w: 38, h: 7 },
      },
      {
        key: "auditor_opinion",
        label: "Auditor Attestation",
        value: "Unqualified — Deloitte & Touche LLP",
        confidence: 99.2,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 80, w: 68, h: 6 },
      },
    ],
    riskFlags: [],
  },
  {
    id: "DOC-8837",
    title: "Kestrel Security SOC-2 Type II Attestation",
    fileName: "kestrel_soc2_type2_2026_report.pdf",
    folder: "Compliance Filings",
    schemaId: "sch-soc2-type2",
    schemaName: "SOC-2 Type II Compliance Report",
    status: "warning",
    confidence: 88.9,
    pages: 44,
    tokensUsed: 26400,
    sha256Prefix: "5e82d910f4c3",
    ingestedAt: "2026-11-12 22:14 UTC",
    owner: "Elena Rostova",
    documentKind: "compliance",
    documentHeaderMeta: {
      issuer: "Schellman & Company, LLC",
      refCode: "SOC2-2026-KSL",
      dateLabel: "Oct 01, 2025 – Sep 30, 2026",
    },
    summary:
      "SOC-2 Type II attestation for Kestrel Security Platforms covering Security, Availability, and Confidentiality criteria. Two user-access provisioning exceptions were noted under CC6.2; exception remediation notes require compliance sign-off.",
    rawText: `INDEPENDENT SERVICE AUDITOR'S REPORT (SOC-2 TYPE II)
Service Organization: Kestrel Security Platforms, Inc.
Independent CPA Firm: Schellman & Company, LLC
Observation Window: October 1, 2025 – September 30, 2026
Trust Services Criteria: Security, Availability, Confidentiality
Control Exceptions Count: 2 Exceptions Noted (CC6.2 Offboarding SLA)`,
    fields: [
      {
        key: "service_org",
        label: "Service Organization",
        value: "Kestrel Security Platforms, Inc.",
        confidence: 99.1,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 20, w: 54, h: 6 },
      },
      {
        key: "audit_firm",
        label: "Independent CPA Firm",
        value: "Schellman & Company, LLC",
        confidence: 98.4,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 34, w: 48, h: 6 },
      },
      {
        key: "audit_period",
        label: "Observation Window",
        value: "Oct 01, 2025 – Sep 30, 2026",
        confidence: 96.8,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 48, w: 52, h: 6 },
      },
      {
        key: "trust_criteria",
        label: "Trust Services Criteria",
        value: "Security, Availability, Confidentiality",
        confidence: 95.3,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 62, w: 62, h: 6 },
      },
      {
        key: "exceptions_noted",
        label: "Control Exceptions Count",
        value: "2 Exceptions (CC6.2 Offboarding)",
        confidence: 76.4,
        status: "warning",
        page: 1,
        bbox: { x: 8, y: 77, w: 58, h: 7 },
      },
    ],
    riskFlags: [
      {
        severity: "medium",
        clause: "Control CC6.2 — Access Revocation",
        explanation: "2 contractor accounts remained active 36h past contract termination; management remediation attached on p. 38.",
      },
    ],
  },
  {
    id: "DOC-8835",
    title: "Apex Semiconductor Supply Agreement",
    fileName: "apex_semi_supply_msa_amendment_4.pdf",
    folder: "Legal Contracts",
    schemaId: "sch-msa-v3",
    schemaName: "Master Services Agreement",
    status: "validated",
    confidence: 97.4,
    pages: 22,
    tokensUsed: 18100,
    sha256Prefix: "a19c70fe448d",
    ingestedAt: "2026-11-12 18:05 UTC",
    owner: "Devon Brooks",
    documentKind: "contract",
    documentHeaderMeta: {
      issuer: "Apex Semiconductor Corp.",
      refCode: "MSA-AMD4-2026",
      dateLabel: "Executed Oct 28, 2026",
    },
    summary:
      "Fourth amendment to the Apex Semiconductor Supply MSA establishing a $1,250,000 annual wafer allocation commitment, governed under New York law with a 2x annual fee liability cap and 90-day written renewal notice.",
    rawText: `AMENDMENT NO. 4 TO MASTER SUPPLY AGREEMENT
Counterparty Legal Entity: Apex Semiconductor Corp.
Effective Date: October 28, 2026
Annual Contract Value: $1,250,000.00
Limitation of Liability Cap: 24 months fees paid
Governing Jurisdiction: State of New York
Renewal Notice Window: 90 days prior written notice`,
    fields: [
      {
        key: "counterparty_name",
        label: "Counterparty Legal Entity",
        value: "Apex Semiconductor Corp.",
        confidence: 99.2,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 21, w: 46, h: 6 },
      },
      {
        key: "effective_date",
        label: "Effective Date",
        value: "2026-10-28",
        confidence: 98.8,
        status: "validated",
        page: 1,
        bbox: { x: 56, y: 21, w: 34, h: 6 },
      },
      {
        key: "contract_value",
        label: "Annual Contract Value",
        value: "$1,250,000.00",
        confidence: 98.1,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 36, w: 42, h: 7 },
      },
      {
        key: "liability_cap",
        label: "Limitation of Liability Cap",
        value: "24 months fees paid",
        confidence: 95.9,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 50, w: 62, h: 7 },
      },
      {
        key: "governing_law",
        label: "Governing Jurisdiction",
        value: "State of New York",
        confidence: 97.7,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 64, w: 38, h: 6 },
      },
      {
        key: "renewal_notice_days",
        label: "Renewal Notice Window",
        value: "90 days prior written notice",
        confidence: 95.1,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 78, w: 54, h: 6 },
      },
    ],
    riskFlags: [
      {
        severity: "low",
        clause: "Section 2 — Liability Multiplier",
        explanation: "Liability cap is 24 months (2x standard 12-month corporate baseline).",
      },
    ],
  },
  {
    id: "DOC-8833",
    title: "Helios Legal Retainer Invoice #HL-2026-88",
    fileName: "helios_llp_retainer_oct2026.pdf",
    folder: "Vendor Invoices",
    schemaId: "sch-inv-v2",
    schemaName: "Commercial Vendor Invoice",
    status: "validated",
    confidence: 98.1,
    pages: 4,
    tokensUsed: 4120,
    sha256Prefix: "3b08f12c9e71",
    ingestedAt: "2026-11-12 14:32 UTC",
    owner: "Marcus Vance",
    documentKind: "invoice",
    documentHeaderMeta: {
      issuer: "Helios & Sterling LLP",
      refCode: "HL-2026-88",
      dateLabel: "Issued Nov 01, 2026",
    },
    summary:
      "Monthly IP and regulatory counsel retainer invoice from Helios & Sterling LLP for $64,500.00 under PO-2026-3901 on Net 30 payment terms. All line items and tax exemptions matched ERP master records.",
    rawText: `LEGAL SERVICES INVOICE — HELIOS & STERLING LLP
Invoice Reference: HL-2026-88
Purchase Order ID: PO-2026-3901
Subtotal (Pre-Tax): $64,500.00
Total Amount Due: $64,500.00
Payment Terms: Net 30 Days`,
    fields: [
      {
        key: "vendor_name",
        label: "Vendor Name",
        value: "Helios & Sterling LLP",
        confidence: 99.4,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 18, w: 52, h: 6 },
      },
      {
        key: "invoice_number",
        label: "Invoice Reference",
        value: "HL-2026-88",
        confidence: 98.8,
        status: "validated",
        page: 1,
        bbox: { x: 64, y: 18, w: 28, h: 6 },
      },
      {
        key: "po_number",
        label: "Purchase Order ID",
        value: "PO-2026-3901",
        confidence: 97.6,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 31, w: 36, h: 6 },
      },
      {
        key: "subtotal_amount",
        label: "Subtotal (Pre-Tax)",
        value: "$64,500.00",
        confidence: 98.5,
        status: "validated",
        page: 1,
        bbox: { x: 54, y: 52, w: 36, h: 7 },
      },
      {
        key: "total_due",
        label: "Total Amount Due",
        value: "$64,500.00",
        confidence: 98.7,
        status: "validated",
        page: 1,
        bbox: { x: 54, y: 69, w: 36, h: 8 },
      },
      {
        key: "payment_terms",
        label: "Payment Terms",
        value: "Net 30 Days",
        confidence: 95.8,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 82, w: 34, h: 6 },
      },
    ],
    riskFlags: [],
  },
  {
    id: "DOC-8830",
    title: "Cobalt Robotics Hardware Lease Scan",
    fileName: "cobalt_robotics_fax_corrupt_scan.pdf",
    folder: "Vendor Invoices",
    schemaId: "sch-inv-v2",
    schemaName: "Commercial Vendor Invoice",
    status: "failed",
    confidence: 41.2,
    pages: 3,
    tokensUsed: 980,
    sha256Prefix: "f04e882a11d9",
    ingestedAt: "2026-11-12 11:08 UTC",
    owner: "Priya Nair",
    documentKind: "invoice",
    documentHeaderMeta: {
      issuer: "Cobalt Robotics Inc. (Unverified)",
      refCode: "CR-FAX-009?",
      dateLabel: "Scan Skew 14.2°",
    },
    summary:
      "OCR extraction failed due to severe page skew (14.2°) and clipped right-hand margin cutting off currency totals on Page 1. Re-scan or manual re-ingestion required.",
    rawText: `COBALT ROBOTICS INC. — EQUIPMENT LEASE STATEMENT
Invoice Reference: CR-FAX-009[ILLEGIBLE]
Purchase Order ID: PO-2026-41[CLIPPED]
Subtotal (Pre-Tax): $18,2[CLIPPED]
Total Amount Due: [MARGIN CLIPPED]
Payment Terms: Net 30`,
    fields: [
      {
        key: "vendor_name",
        label: "Vendor Name",
        value: "Cobalt Robotics Inc.",
        confidence: 91.2,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 18, w: 52, h: 6 },
      },
      {
        key: "invoice_number",
        label: "Invoice Reference",
        value: "CR-FAX-009?",
        confidence: 38.4,
        status: "warning",
        page: 1,
        bbox: { x: 64, y: 18, w: 28, h: 6 },
      },
      {
        key: "po_number",
        label: "Purchase Order ID",
        value: "PO-2026-41??",
        confidence: 32.0,
        status: "warning",
        page: 1,
        bbox: { x: 8, y: 31, w: 36, h: 6 },
      },
      {
        key: "total_due",
        label: "Total Amount Due",
        value: "[UNREADABLE — MARGIN CLIPPED]",
        confidence: 18.5,
        status: "warning",
        page: 1,
        bbox: { x: 54, y: 69, w: 36, h: 8 },
      },
    ],
    riskFlags: [
      {
        severity: "high",
        clause: "Margin Clipping & Skew",
        explanation: "Right margin truncated 18mm during fax capture; monetary total cannot be cryptographically verified.",
      },
    ],
  },
  {
    id: "DOC-8828",
    title: "EU GDPR Data Processing Addendum (DPA)",
    fileName: "eu_gdpr_dpa_solaris_2026.pdf",
    folder: "Compliance Filings",
    schemaId: "sch-msa-v3",
    schemaName: "Master Services Agreement",
    status: "validated",
    confidence: 96.9,
    pages: 15,
    tokensUsed: 13200,
    sha256Prefix: "6d12ab49c70e",
    ingestedAt: "2026-11-11 19:40 UTC",
    owner: "Devon Brooks",
    documentKind: "compliance",
    documentHeaderMeta: {
      issuer: "Solaris Analytics GmbH",
      refCode: "DPA-EU-2026-11",
      dateLabel: "Executed Oct 19, 2026",
    },
    summary:
      "Standard Contractual Clauses (SCC Module Two) Data Processing Addendum with Solaris Analytics GmbH. Sub-processor notification window set at 30 days with Frankfurt (eu-central-1) residency lock.",
    rawText: `DATA PROCESSING ADDENDUM (EU SCC MODULE TWO)
Counterparty Legal Entity: Solaris Analytics GmbH
Effective Date: October 19, 2026
Annual Contract Value: $195,000.00 (Underlying SaaS Schedule)
Limitation of Liability Cap: 2x Annual Fees for Data Breach
Governing Jurisdiction: Federal Republic of Germany (Frankfurt)
Renewal Notice Window: 30 days sub-processor notice`,
    fields: [
      {
        key: "counterparty_name",
        label: "Counterparty Legal Entity",
        value: "Solaris Analytics GmbH",
        confidence: 98.9,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 21, w: 46, h: 6 },
      },
      {
        key: "effective_date",
        label: "Effective Date",
        value: "2026-10-19",
        confidence: 98.2,
        status: "validated",
        page: 1,
        bbox: { x: 56, y: 21, w: 34, h: 6 },
      },
      {
        key: "contract_value",
        label: "Annual Contract Value",
        value: "$195,000.00",
        confidence: 96.4,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 36, w: 42, h: 7 },
      },
      {
        key: "liability_cap",
        label: "Limitation of Liability Cap",
        value: "2x Annual Fees (Data Breach)",
        confidence: 95.3,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 50, w: 62, h: 7 },
      },
      {
        key: "governing_law",
        label: "Governing Jurisdiction",
        value: "Federal Republic of Germany",
        confidence: 97.1,
        status: "validated",
        page: 1,
        bbox: { x: 8, y: 64, w: 38, h: 6 },
      },
    ],
    riskFlags: [],
  },
];

export const SAMPLE_INGEST_PRESETS = [
  {
    id: "sample-msa",
    label: "Horizon BioTech Enterprise MSA (Text)",
    schemaId: "sch-msa-v3",
    folder: "Legal Contracts" as const,
    title: "Horizon BioTech Enterprise MSA",
    fileName: "horizon_biotech_msa_2026.pdf",
    rawText: `MASTER SERVICES AGREEMENT — HORIZON BIOTECH LABS INC.
Reference: MSA-HB-2026-119
Effective Date: November 12, 2026
Counterparty Legal Entity: Horizon BioTech Labs Inc.
Annual Contract Value: $620,000.00 USD
Limitation of Liability Cap: 18 months trailing fees (excluding IP indemnification)
Governing Jurisdiction: State of California
Renewal Notice Window: 45 days prior written notice
Special Notes: Includes dedicated HIPAA BAA schedule and 99.95% uptime SLA credit matrix.`,
  },
  {
    id: "sample-invoice",
    label: "Stratos Security Cloud Invoice #STR-7721",
    schemaId: "sch-inv-v2",
    folder: "Vendor Invoices" as const,
    title: "Stratos Security Invoice #STR-7721",
    fileName: "stratos_security_inv_7721.pdf",
    rawText: `COMMERCIAL INVOICE — STRATOS CLOUD SECURITY INC.
Vendor Name: Stratos Cloud Security Inc.
Invoice Reference: STR-7721
Purchase Order ID: PO-2026-4902
Subtotal (Pre-Tax): $42,000.00
Enterprise WAF Add-on (unlisted on PO): $4,800.00
Total Amount Due: $46,800.00
Payment Terms: Net 30 Days`,
  },
];
