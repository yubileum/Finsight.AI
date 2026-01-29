
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Transaction, AnalysisResult, StructuredDeepInsight } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export interface FilePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

/**
 * Extracts transactions and reconciliation summaries from financial documents.
 */
export async function analyzeStatementParts(parts: FilePart[]): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        ...parts,
        {
          text: `ROLE: ELITE FINANCIAL AUDITOR.
          
          OBJECTIVE: Extract credit card statement data with 100% MATHEMATICAL CONSISTENCY.
          
          CRITICAL INSTRUCTION: TALLY CHECK FIRST.
          1. Extract all line item expenses.
          2. Sum them up immediately in your reasoning.
          3. Locate the "Total New Balance" or "Total Purchases" on the statement image.
          4. IF THEY DO NOT MATCH, you have missed a transaction or misread a number. RE-SCAN line by line until they match perfectly.
          
          EXTRACTION RULES:
          - IGNORE payments/credits (values that reduce balance) unless asked. Focus on EXPENSES.
          - Capture exact decimals.
          - Identify currency (USD, EUR, GBP, etc.) for each item.
          
          OUTPUT JSON STRUCTURE:
          {
            "transactions": [{date, description, amount, currency, category}],
            "summaries": [{currency, reportedTotal, calculatedTotal}]
          }
          
          "reportedTotal" = The summary number printed on the PDF.
          "calculatedTotal" = The sum of your extracted transaction list.
          These MUST match.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ['date', 'description', 'amount', 'currency', 'category']
            }
          },
          summaries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                currency: { type: Type.STRING },
                reportedTotal: { type: Type.NUMBER, description: 'The grand total explicitly printed on the document' },
                calculatedTotal: { type: Type.NUMBER, description: 'The sum of the extracted transactions' }
              },
              required: ['currency', 'reportedTotal', 'calculatedTotal']
            }
          }
        },
        required: ['transactions', 'summaries']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Could not read statement data. Ensure the file is clear.");
  
  try {
    const data = JSON.parse(text);
    return {
      transactions: data.transactions.map((item: any, index: number) => ({
        ...item,
        id: `tx-${Date.now()}-${index}`
      })),
      summaries: data.summaries.map((s: any) => ({
        ...s,
        isTally: Math.abs(s.reportedTotal - s.calculatedTotal) < 0.1 // Allow slight float tolerance
      }))
    };
  } catch (e) {
    console.error("Extraction Parse Error:", text);
    throw new Error("Analysis failed. Please try a clearer image.");
  }
}

export async function getDeepInsights(transactions: Transaction[]): Promise<StructuredDeepInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze these transactions and provide a structured financial health report. 
  
  Focus on: 
  1. Executive summary (Concise, high-level observation). 
  2. 3-4 Key metrics (e.g., Daily Average, Top Category %, Discretionary vs Essential). 
  3. Actionable tips (3 specific ways to save money). 
  4. Red flags (Subscription traps, unusual frequencies, duplicate charges).
  
  Data: ${JSON.stringify(transactions)}`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { 
      // Optimized budget: 8192 is enough for analysis, 32k is too slow.
      thinkingConfig: { thinkingBudget: 8192 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                icon: { type: Type.STRING, description: "Keyword: 'wallet', 'trend-up', 'chart', 'alert', 'lightning'" }
              },
              required: ['label', 'value', 'icon']
            }
          },
          tips: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
              },
              required: ['title', 'description', 'priority']
            }
          },
          redFlags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['executiveSummary', 'metrics', 'tips', 'redFlags']
      }
    },
  });

  const text = response.text;
  if (!text) throw new Error("No insights available.");
  return JSON.parse(text);
}
