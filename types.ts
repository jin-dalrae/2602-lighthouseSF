
export enum Area {
  PS = 'Public Safety',
  IU = 'Infrastructure & Utilities',
  LZ = 'Land Use & Zoning',
}

export enum AgentType {
  DATA = 'Data Agent',
  NEWS = 'News Agent',
  GOV = 'Gov Agent',
}

export enum AgentStatus {
  IDLE = 'idle',
  FETCHING = 'fetching',
  ANALYZING = 'analyzing',
  DONE = 'done',
  ERROR = 'error',
}

export interface Agent {
  id: number;
  area: Area;
  type: AgentType;
  name: string;
  status: AgentStatus;
  lastMessage?: string;
  payload?: string; // The raw data fetched
  analysis?: string; // The agent's specific analysis
}

export enum PipelineStage {
  IDLE = 0,
  FETCH = 1,
  ANALYZE = 2,
  CONSOLIDATE = 3,
  DISCUSS = 4,
  CARDS = 5,
  CHARTS = 6,
  FOLLOW_UP = 7,
  VIDEO = 8,
  MARATHON = 9,
}

export interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface IssueCard {
  id: number;
  title: string;
  summary: string;
  areas: Area[];
  cross_area: boolean;
  contributing_agents: number[];
  confidence: "High" | "Medium" | "Low";
  severity: "Critical" | "High" | "Medium" | "Low"; // Retained for UI priority
  time_horizon: "1wk" | "30d" | "90d" | "1yr" | "5yr" | "10yr";
  forecast: { "1y": string; "5y": string; "10y": string };
  data_refs: string[];
  action_item: string; // Retained for Action Queue
  chart_spec?: ChartConfig | null;
}

export interface ChartDataPoint {
  [key: string]: string | number | undefined;
}

export interface ChartConfig {
  chart_type: "line" | "bar" | "area" | "composed" | "time_series" | "heatmap" | "funnel";
  title: string;
  data: ChartDataPoint[];
  config: {
    xKey: string;
    yKeys: { key: string; color: string; label: string }[];
    forecast_overlay?: boolean;
  };
}

// Gemini Types
export interface VideoGenerationResult {
  uri: string;
  mimeType: string;
}
