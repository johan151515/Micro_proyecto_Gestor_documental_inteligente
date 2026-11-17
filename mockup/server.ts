import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "documind-enterprise" });
  });

  // Extract structured OCR fields, bounding-box coordinates, risk flags, and narrative synthesis
  app.post("/api/documents/extract", async (req, res) => {
    try {
      const { title, schemaName, schemaFields, textContent, imageBase64, mimeType } = req.body as {
        title: string;
        schemaName: string;
        schemaFields: Array<{ key: string; label: string; type: string }>;
        textContent?: string;
        imageBase64?: string;
        mimeType?: string;
      };

      if (!title || (!textContent && !imageBase64)) {
        res.status(400).json({ error: "Document title and either text content or image payload are required." });
        return;
      }

      const ai = getAiClient();
      const fieldPromptList = (schemaFields || [])
        .map((f) => `- key: "${f.key}", label: "${f.label}", expectedType: "${f.type}"`)
        .join("\n");

      const instruction = `You are DocuMind Enterprise's document verification and OCR extraction engine.
Analyze the provided document ("${title}") against the "${schemaName}" schema.
Extract each requested schema field accurately, estimate realistic OCR confidence (0.0 to 100.0), and provide approximate normalized bounding box coordinates (x, y, w, h in percentage 0..100 of the page) where each field appears.
If a value is missing, ambiguous, or hard to read, set confidence below 85.0 and status to "warning". Otherwise set status to "validated".
Also provide a concise 2-3 sentence executive narrative synthesis and list any compliance/financial risk flags detected.

Target schema fields:
${fieldPromptList || "- Extract the primary entities, dates, counterparty names, monetary totals, and key clauses."}`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (imageBase64 && mimeType) {
        parts.push({
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        });
      }
      parts.push({
        text: textContent
          ? `${instruction}\n\nDocument Text Content:\n${textContent}`
          : `${instruction}\n\nPerform multimodal OCR and schema extraction on the attached document image.`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallConfidence: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              ocrTranscript: { type: Type.STRING },
              fields: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    status: { type: Type.STRING },
                    page: { type: Type.INTEGER },
                    bbox: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        w: { type: Type.NUMBER },
                        h: { type: Type.NUMBER },
                      },
                      required: ["x", "y", "w", "h"],
                    },
                  },
                  required: ["key", "label", "value", "confidence", "status", "page", "bbox"],
                },
              },
              riskFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: { type: Type.STRING },
                    clause: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["severity", "clause", "explanation"],
                },
              },
            },
            required: ["overallConfidence", "summary", "fields", "riskFlags"],
          },
        },
      });

      const rawText = response.text?.trim() || "{}";
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Extraction failed.";
      console.error("Extract error:", err);
      res.status(500).json({ error: message });
    }
  });

  // Cross-document narrative synthesis
  app.post("/api/documents/synthesize", async (req, res) => {
    try {
      const { documents, mode, customPrompt } = req.body as {
        documents: Array<{
          id: string;
          title: string;
          schemaName: string;
          confidence: number;
          summary: string;
          fields: Array<{ key: string; label: string; value: string; confidence: number }>;
        }>;
        mode: string;
        customPrompt?: string;
      };

      if (!documents || documents.length === 0) {
        res.status(400).json({ error: "Select at least one document for synthesis." });
        return;
      }

      const ai = getAiClient();
      const docContext = documents
        .map((doc) => {
          const fieldLines = doc.fields
            .map((f) => `  - ${f.label} (${f.key}): ${f.value} [${f.confidence.toFixed(1)}% OCR confidence]`)
            .join("\n");
          return `Document: ${doc.title} (ID: ${doc.id}, Schema: ${doc.schemaName}, Avg Confidence: ${doc.confidence.toFixed(1)}%)\nSummary: ${doc.summary}\nExtracted Fields:\n${fieldLines}`;
        })
        .join("\n\n---\n\n");

      const directive =
        customPrompt?.trim() ||
        (mode === "discrepancy"
          ? "Identify any financial, contractual, date, or compliance discrepancies across these documents and list concrete verification actions."
          : mode === "financial"
            ? "Produce a consolidated financial rollup comparing amounts, payment terms, obligations, and effective periods across these documents."
            : "Produce an executive synthesis highlighting key commitments, shared counterparties, obligations, and priority audit points.");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `You are DocuMind Enterprise's cross-document narrative synthesis engine.
Be concise, analytical, and strictly grounded in the extracted records below. Cite document titles and exact figures when making claims.

Objective: ${directive}

Source Documents:
${docContext}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              executiveBrief: { type: Type.STRING },
              keyFindings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    detail: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    sourceDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["title", "detail", "severity", "sourceDocs"],
                },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["headline", "executiveBrief", "keyFindings", "recommendedActions"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Synthesis failed.";
      console.error("Synthesize error:", err);
      res.status(500).json({ error: message });
    }
  });

  // Document-grounded reviewer Q&A
  app.post("/api/documents/ask", async (req, res) => {
    try {
      const { document, question } = req.body as {
        document: {
          title: string;
          schemaName: string;
          summary: string;
          rawText: string;
          fields: Array<{ key: string; label: string; value: string; confidence: number }>;
        };
        question: string;
      };

      if (!document || !question?.trim()) {
        res.status(400).json({ error: "Document context and question are required." });
        return;
      }

      const ai = getAiClient();
      const fieldsBlock = document.fields
        .map((f) => `- ${f.label} (${f.key}): ${f.value} (${f.confidence.toFixed(1)}%)`)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Answer the reviewer's verification question concisely using only the provided document record. Cite extracted keys or exact clauses where relevant.

Document Title: ${document.title}
Schema: ${document.schemaName}
Executive Summary: ${document.summary}
Extracted Fields:
${fieldsBlock}

Source Transcript:
${document.rawText}

Reviewer Question: ${question}`,
      });

      res.json({ answer: response.text || "No response returned." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Document Q&A failed.";
      console.error("Ask error:", err);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DocuMind Enterprise server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
