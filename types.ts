
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
}

export interface StatementSummary {
  id: string;
  currency: string;
  reportedTotal: number;
  calculatedTotal: number;
  isTally: boolean;
}

export interface AnalysisResult {
  transactions: Transaction[];
  summaries: Omit<StatementSummary, 'id'>[];
}

export interface DeepInsightMetric {
  label: string;
  value: string;
  icon: string;
}

export interface ActionableTip {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StructuredDeepInsight {
  executiveSummary: string;
  metrics: DeepInsightMetric[];
  tips: ActionableTip[];
  redFlags: string[];
}

export interface SpendingSummary {
  category: string;
  total: number;
  count: number;
  currency: string;
}

export interface AnalysisInsight {
  title: string;
  description: string;
  type: 'saving' | 'warning' | 'info';
}

export enum AnalysisMode {
  FAST = 'fast',
  THINKING = 'thinking'
}
