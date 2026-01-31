
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Transaction, AnalysisResult, StructuredDeepInsight } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

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

          CRITICAL INSTRUCTION - TALLY VERIFICATION:
          1. Extract EVERY line item expense from the statement. Do not skip any.
          2. For each transaction: date (YYYY-MM-DD), description, amount (number), currency (e.g. USD, EUR, PLN), category.
          3. Find "Total New Balance", "Total Purchases", "Total Amount Due" or equivalent on the statement - this is reportedTotal.
          4. The sum of ALL extracted transaction amounts MUST equal reportedTotal. If not, you missed transactions - re-scan line by line.

          EXTRACTION RULES:
          - Include ALL expense/debit transactions. Exclude only payments, credits, refunds.
          - Use numeric amount (e.g. 123.45), not strings. Preserve decimals.
          - Currency: use the symbol/code from the statement (USD, EUR, PLN, GBP, etc.).

          OUTPUT JSON:
          {
            "transactions": [{date, description, amount, currency, category}],
            "summaries": [{currency, reportedTotal, calculatedTotal}]
          }
          IMPORTANT: Return exactly ONE summary per currency. reportedTotal = the GRAND TOTAL printed on the statement (e.g. Total Purchases, Total Amount Due, New Balance) that equals the sum of ALL extracted transactions in that currency.`
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

    const parseAmount = (v: unknown): number => {
      if (typeof v === 'number' && !isNaN(v)) return v;
      const s = String(v ?? '').replace(/,/g, '');
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const normalizeCurrency = (v: unknown): string => {
      const s = String(v ?? 'USD').trim().toUpperCase();
      if (s === '$') return 'USD';
      return s || 'USD';
    };

    const transactions = (data.transactions || []).map((item: any, index: number) => {
      const amount = Math.round(parseAmount(item.amount) * 100) / 100;
      return {
        ...item,
        id: `tx-${Date.now()}-${index}`,
        amount,
        currency: normalizeCurrency(item.currency)
      };
    });

    const sumsByCurrency: Record<string, number> = {};
    transactions.forEach((t: { amount: number; currency: string }) => {
      const c = t.currency;
      const prev = sumsByCurrency[c] ?? 0;
      sumsByCurrency[c] = Math.round((prev + t.amount) * 100) / 100;
    });

    const rawSummaries = data.summaries || [];
    const seenCurrencies = new Set<string>();
    const summaries: Array<{ currency: string; reportedTotal: number; calculatedTotal: number; isTally: boolean }> = [];

    for (const c of Object.keys(sumsByCurrency)) {
      const ourCalculated = sumsByCurrency[c];
      const candidates = rawSummaries.filter((s: any) => normalizeCurrency(s.currency) === c);
      const reported = candidates.length === 0
        ? ourCalculated
        : candidates.length === 1
          ? Math.round(parseAmount(candidates[0].reportedTotal) * 100) / 100
          : (() => {
              // Multiple summaries for same currency (e.g. Purchases + Fees)
              const summed = candidates.reduce((acc: number, s: any) => acc + parseAmount(s.reportedTotal), 0);
              const summedRounded = Math.round(summed * 100) / 100;
              if (Math.abs(summedRounded - ourCalculated) < 0.005) return summedRounded;
              // Otherwise pick the one closest to our calculated (likely grand total)
              let best = candidates[0];
              let bestDiff = Infinity;
              for (const s of candidates) {
                const r = Math.round(parseAmount(s.reportedTotal) * 100) / 100;
                const diff = Math.abs(r - ourCalculated);
                if (diff < bestDiff) {
                  bestDiff = diff;
                  best = s;
                }
              }
              return Math.round(parseAmount(best.reportedTotal) * 100) / 100;
            })();

      const ourRounded = Math.round(ourCalculated * 100) / 100;
      const reportedRounded = Math.round(reported * 100) / 100;
      const isTally = Math.abs(ourRounded - reportedRounded) < 0.005; // half-cent tolerance for float

      summaries.push({
        currency: c,
        reportedTotal: reportedRounded,
        calculatedTotal: ourRounded,
        isTally,
        id: `summary-${Date.now()}-${summaries.length}`
      });
      seenCurrencies.add(c);
    }

    for (const s of rawSummaries) {
      const c = normalizeCurrency(s.currency);
      if (!seenCurrencies.has(c)) {
        const reported = Math.round(parseAmount(s.reportedTotal) * 100) / 100;
        const ourCalculated = sumsByCurrency[c] ?? 0;
        const ourRounded = Math.round(ourCalculated * 100) / 100;
        summaries.push({
          currency: c,
          reportedTotal: reported,
          calculatedTotal: ourRounded,
          isTally: Math.abs(ourRounded - reported) < 0.005,
          id: `summary-${Date.now()}-${summaries.length}`
        });
        seenCurrencies.add(c);
      }
    }

    return {
      transactions,
      summaries
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
