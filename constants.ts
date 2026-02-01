
import { Agent, Area, AgentType, AgentStatus } from './types';

// Color Palette
export const C = {
  paper: "#F7F6F2",
  navy: "#1B2845",
  navyMid: "#2E4A7A",
  mint: "#3CBFAD",
  mintLight: "#E6F7F5",
  mintMid: "#A8E6DC",
  pink: "#E8879B",
  pinkLight: "#FBE8ED",
  pinkMid: "#F5C4D0",
  // area colors mapped to palette
  ps: "#E8879B",      // pink = Public Safety
  psLight: "#FBE8ED",
  iu: "#3CBFAD",      // mint = Infrastructure
  iuLight: "#E6F7F5",
  lz: "#1B2845",      // navy = Land Use
  lzLight: "#EDF1F7",
  // source type
  data: "#3CBFAD",
  news: "#E8879B",
  gov: "#1B2845",
  gray1: "#6B7280",
  gray2: "#9CA3AF",
  gray3: "#E5E7EB",
  white: "#FFFFFF",
};

export const INITIAL_AGENTS: Agent[] = [
  // Public Safety
  { id: 1, area: Area.PS, type: AgentType.DATA, name: 'PS-1 (SODA)', status: AgentStatus.IDLE },
  { id: 2, area: Area.PS, type: AgentType.NEWS, name: 'PS-2 (News)', status: AgentStatus.IDLE },
  { id: 3, area: Area.PS, type: AgentType.GOV, name: 'PS-3 (Gov)', status: AgentStatus.IDLE },
  // Infrastructure
  { id: 4, area: Area.IU, type: AgentType.DATA, name: 'IU-4 (SODA)', status: AgentStatus.IDLE },
  { id: 5, area: Area.IU, type: AgentType.NEWS, name: 'IU-5 (News)', status: AgentStatus.IDLE },
  { id: 6, area: Area.IU, type: AgentType.GOV, name: 'IU-6 (Gov)', status: AgentStatus.IDLE },
  // Land Use
  { id: 7, area: Area.LZ, type: AgentType.DATA, name: 'LZ-7 (SODA)', status: AgentStatus.IDLE },
  { id: 8, area: Area.LZ, type: AgentType.NEWS, name: 'LZ-8 (News)', status: AgentStatus.IDLE },
  { id: 9, area: Area.LZ, type: AgentType.GOV, name: 'LZ-9 (Gov)', status: AgentStatus.IDLE },
];

export const MODEL_FLASH = 'gemini-3-flash-preview';
export const MODEL_PRO = 'gemini-3-pro-preview';
export const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

export const SYSTEM_INSTRUCTIONS = {
  ORCHESTRATOR: `You are the Master Orchestrator of the SF City Intelligence Platform. 
  Your goal is to synthesize multi-agent reports into actionable issue cards. 
  Focus on cross-referencing data between Public Safety, Infrastructure, and Zoning. 
  Highlight contradictions. Prioritize safety and infrastructure reliability.`,
  
  AGENT_FETCH_SIMULATION: (agent: Agent) => `You are Agent ${agent.name} for the ${agent.area} domain in San Francisco.
  Simulate a fetch operation for your data source (${agent.type}).
  
  If Data Agent (SODA): Simulate fetching recent JSON rows from SF Open Data regarding your domain (e.g., Police Incidents, 311 Cases, Building Permits).
  If News Agent (NBC): Simulate scraping 3-5 recent headlines and summaries relevant to SF ${agent.area}.
  If Gov Agent (sf.gov): Simulate retrieving 3 relevant agenda items or legislative files from Legistar/SF.gov.

  Return the data in a raw, structured text format. Make it realistic for San Francisco current events.`,
  
  AGENT_ANALYZE: (agent: Agent) => `Analyze the following raw payload for ${agent.area}. 
  Identify top 3 trends, anomalies, or critical alerts. 
  Be concise. Output bullet points.`,

  CONSOLIDATOR: (area: Area) => `You are the ${area} Consolidator.
  Input: Findings from Data, News, and Gov agents for your area.
  Task: Merge these findings, deduplicate, align signals, and flag conflicts explicitly.
  
  Output STRICT JSON format:
  {
    "summary": "High-level narrative (max 3 sentences)",
    "issues": ["Specific issue 1", "Specific issue 2"],
    "signals": ["Data trend X", "News sentiment Y"],
    "conflicts": ["Conflict A vs B"],
    "confidence": "High" | "Medium" | "Low"
  }
  Do not use markdown.`,

  CROSS_AREA_ORCHESTRATOR: `[Phase 0 system, role = "Cross-Area Discussion Orchestrator"]
  Round-robin rules: 2–3 rounds max. Each area consolidator reads others → flags connections → no redundancy.
  
  Step-by-step:
  1. PS checks IU & LZ for impacts on safety
  2. IU checks PS & LZ for capacity strain
  3. LZ checks PS & IU for downstream effects
  4. Run 2 rounds or until no new flags
  5. Output final unified issues JSON:
  
  {
    "thoughts": "string (discussion trace/summary)",
    "single_area_issues": ["string (issue summary)"],
    "cross_area_issues": [{"involves": "string (e.g. PS+IU)", "title": "string", "impact": "string"}],
    "all_area_convergence": ["string"] or null
  }
  Output STRICT JSON only.`,

  DISCUSSANT: (myArea: Area) => `You are the ${myArea} Consolidator participating in a Cross-Area Roundtable.
  You will receive the consolidated reports from the OTHER two areas.
  
  Task: Identify connections between YOUR area (${myArea}) and the OTHERS.
  Look for patterns:
  - PS + IU: Fire response times vs Road closures/Construction.
  - PS + LZ: Crime density vs New development/Rezoning.
  - IU + LZ: Infrastructure capacity vs Permit spikes.
  - Cascade: Safety + Infra + Zoning interactions.

  Output: A brief insight paragraph focusing ONLY on cross-area connections. If none, state "No significant overlap detected."`,
  
  CARD_GENERATOR: `Generate a valid JSON array of "Issue Cards" based on the consolidated discussion.
  STRICT JSON output only. No markdown.
  
  Schema per card:
  {
    "id": number,
    "title": "string (headline)",
    "summary": "string (2-3 sentences)",
    "areas": ["Public Safety" | "Infrastructure & Utilities" | "Land Use & Zoning"],
    "cross_area": boolean,
    "contributing_agents": [number],
    "confidence": "High" | "Medium" | "Low",
    "severity": "Critical" | "High" | "Medium" | "Low",
    "time_horizon": "1wk" | "30d" | "90d" | "1yr" | "5yr" | "10yr",
    "forecast": { "1y": "string", "5y": "string", "10y": "string" },
    "data_refs": ["string (dataset IDs or URLs)"],
    "action_item": "string (recommended next step)",
    "chart_spec": null
  }`,

  CHART_GENERATOR: `[Phase 0 system, role = "Chart Agent"]
  Input: issue data {json with numbers, e.g. crime by district, outage minutes, permit funnel}
  
  Generate Recharts JSON config for one chart.
  Supported types: "line", "bar", "area", "composed"
  (Map 'time_series' to 'line')
  
  Output JSON only. Schema:
  {
    "chart_type": "line" | "bar" | "area" | "composed",
    "title": "string (Chart Title)",
    "data": [{"name": "Label", "key1": 100, "key2": 200}],
    "config": {
      "xKey": "name",
      "yKeys": [{"key": "key1", "color": "#3CBFAD", "label": "Metric"}],
      "forecast_overlay": boolean
    }
  }`,

  MARATHON_ORCHESTRATOR: `You are Marathon Orchestrator.

Previous cycle issues: {list}
Fresh data pull: {new signals}

For each past issue:
- Status: improving | stagnant | worsening
- If worsening → escalate & flag

Then generate new "possible work list" from all 9 agents:
JSON: {
  "followed_up": [...],
  "new_suggestions": [{"agent": "PS Data", "action": "deep dive Tenderloin drug hotspots", "priority": 8/10}]
}`,

  VIDEO_AGENT_PLANNER: `[Phase 0 system, role = "Video Agent"]

Top issue: {issue card JSON}

Create 30s video plan:
1. Storyboard: 4–5 scenes with description
2. Suggest Imagen prompts for static frames
3. Veo chain plan: image1 → 8s clip → extend 3× from last frame

Output JSON:
{
  "storyboard": [{"scene":1, "desc":"...", "imagen_prompt":"..."}],
  "veo_chain_steps": ["clip1 from frame1", "extend from clip1 end", ...],
  "total_duration_sec": 30
}`
};
