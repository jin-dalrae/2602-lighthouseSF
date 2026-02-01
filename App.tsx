
import React, { useState, useEffect, useRef } from 'react';
import { 
  Agent, PipelineStage, AgentStatus, IssueCard, ChartConfig, LogEntry, Area, AgentType 
} from './types';
import { INITIAL_AGENTS, SYSTEM_INSTRUCTIONS, C } from './constants';
import { ProcessChart } from './components/ProcessChart';
import { IssueFeed } from './components/IssueFeed';
import { ForecastPanel } from './components/ForecastPanel';
import { AgentLog } from './components/AgentLog';
import { ActionQueue } from './components/ActionQueue';
import { FollowUpTracker } from './components/FollowUpTracker';
import { LandingPage } from './components/LandingPage';
import { 
  generateAgentContent, 
  generateOrchestratorContent, 
  generateReportVideo, 
  fetchNewsWithGrounding, 
  fetchGovData, 
  consolidateAreaFindings,
  runRoundtableDiscussion
} from './services/gemini';
import { fetchPSData, fetchIUData, fetchLZData } from './services/soda';
import { Play, RotateCw } from 'lucide-react';

export default function App() {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState("issues");
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<Record<string, string>>({}); 
  const [discussionLog, setDiscussionLog] = useState<string[]>([]);
  const [issueCards, setIssueCards] = useState<IssueCard[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  const addLog = (message: string, type: LogEntry['type'] = 'info', source: string = 'System') => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), source, message, type }]);
  };

  const updateAgent = (id: number, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const getNewsKeywords = (area: Area): string => {
    switch (area) {
      case Area.PS: return "crime, fire, emergency, police, safety";
      case Area.IU: return "streets, water, transit, construction, infrastructure";
      case Area.LZ: return "housing, zoning, development, rent, rezoning";
      default: return "San Francisco news";
    }
  };

  // --- Pipeline Logic ---
  const startFetch = async () => {
    setPipelineStage(PipelineStage.FETCH);
    setActiveTab("process"); 
    addLog('Starting Parallel Fetch (9 Agents)...', 'info', 'Orchestrator');
    
    const fetchPromises = agents.map(async (agent) => {
      updateAgent(agent.id, { status: AgentStatus.FETCHING, lastMessage: 'Connecting...' });
      try {
        let payload = "";

        if (agent.type === AgentType.DATA) {
             await new Promise(r => setTimeout(r, 100 * agent.id));
             if (agent.area === Area.PS) {
                 payload = await fetchPSData();
             } else if (agent.area === Area.IU) {
                 payload = await fetchIUData();
             } else if (agent.area === Area.LZ) {
                 payload = await fetchLZData();
             }
        } else if (agent.type === AgentType.NEWS) {
             await new Promise(r => setTimeout(r, 100 * agent.id));
             const keywords = getNewsKeywords(agent.area);
             payload = await fetchNewsWithGrounding(keywords);
        } else if (agent.type === AgentType.GOV) {
             await new Promise(r => setTimeout(r, 100 * agent.id));
             payload = await fetchGovData(agent.area);
        }

        updateAgent(agent.id, { 
          status: AgentStatus.ANALYZING, 
          payload, 
          lastMessage: 'Payload received. Queued.' 
        });
        addLog(`${agent.name} fetched ${payload.length} chars`, 'success', agent.name);
      } catch (err) {
        updateAgent(agent.id, { status: AgentStatus.ERROR, lastMessage: 'Fetch failed.' });
        addLog(`Fetch failed for ${agent.name}`, 'error', agent.name);
      }
    });
    
    await Promise.all(fetchPromises);
    startAnalyze();
  };

  const startAnalyze = async () => {
    setPipelineStage(PipelineStage.ANALYZE);
    addLog('Agents analyzing payloads...', 'info', 'Orchestrator');
    const analysisPromises = agents.map(async (agent) => {
      if (agent.status === AgentStatus.ERROR || !agent.payload) return;
      try {
        const analysis = await generateAgentContent(
          SYSTEM_INSTRUCTIONS.AGENT_ANALYZE(agent),
          `Analyze this payload: ${agent.payload}`
        );
        updateAgent(agent.id, { 
          status: AgentStatus.DONE, 
          analysis, 
          lastMessage: 'Analysis complete.' 
        });
      } catch (err) {
        updateAgent(agent.id, { status: AgentStatus.ERROR, lastMessage: 'Analysis failed.' });
      }
    });
    await Promise.all(analysisPromises);
    startConsolidation();
  };

  const startConsolidation = async () => {
    setPipelineStage(PipelineStage.CONSOLIDATE);
    addLog('Consolidating per Area (Stage 3)...', 'info', 'Orchestrator');
    const areas = [Area.PS, Area.IU, Area.LZ];
    const newConsolidatedData: Record<string, string> = {};
    
    for (const area of areas) {
      const areaAgents = agents.filter(a => a.area === area && a.analysis);
      const combinedAnalysis = areaAgents.map(a => `${a.name}: ${a.analysis}`).join('\n\n');
      
      try {
        const reportJson = await consolidateAreaFindings(
            SYSTEM_INSTRUCTIONS.CONSOLIDATOR(area),
            `Consolidate these reports into structured JSON:\n${combinedAnalysis}`
        );
        newConsolidatedData[area] = reportJson;
        addLog(`${area} consolidation complete.`, 'success', 'Consolidator');
      } catch (err) {
        addLog(`Failed to consolidate ${area}`, 'error', 'Consolidator');
        newConsolidatedData[area] = JSON.stringify({ summary: "Consolidation failed", issues: [] });
      }
    }
    setConsolidatedData(newConsolidatedData);
    startDiscussion(newConsolidatedData);
  };

  const startDiscussion = async (reports: Record<string, string>) => {
    setPipelineStage(PipelineStage.DISCUSS);
    addLog('Cross-Area Roundtable (Stage 4) initiated...', 'info', 'Orchestrator');
    
    try {
        const discussionJson = await runRoundtableDiscussion(reports);
        
        const trace = discussionJson.thoughts || "Roundtable completed.";
        setDiscussionLog([trace]);
        addLog(`Roundtable complete. Trace: ${trace.substring(0,60)}...`, 'success', 'Orchestrator');
        
        generateCards(reports, discussionJson);

    } catch (e) {
        console.error("Roundtable failed", e);
        addLog('Roundtable failed. Fallback to individual reports.', 'error', 'Orchestrator');
        generateCards(reports, { thoughts: "Discussion Failed", single_area_issues: [], cross_area_issues: [] });
    }
  };

  const generateCards = async (reports: Record<string, string>, discussionData: any) => {
    setPipelineStage(PipelineStage.CARDS);
    addLog('Generating Issue Cards...', 'info', 'Orchestrator');
    
    const reportsText = Object.entries(reports)
      .map(([area, json]) => `AREA: ${area}\nREPORT: ${json}`)
      .join('\n---\n');
      
    const discussionText = JSON.stringify(discussionData, null, 2);

    try {
      const jsonStr = await generateOrchestratorContent(
        SYSTEM_INSTRUCTIONS.CARD_GENERATOR,
        `Generate issue cards from these Area Reports and Cross-Area Discussion Insights:\n\nREPORTS:\n${reportsText}\n\nROUNDTABLE OUTCOME (JSON):\n${discussionText}`,
        true
      );
      const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const cards = JSON.parse(cleanJson);
      setIssueCards(cards);
      addLog(`Generated ${cards.length} issue cards.`, 'success', 'Orchestrator');
      generateChart(cards);
      setActiveTab("issues");
    } catch (err) {
      console.error(err);
      addLog('Failed to generate cards JSON.', 'error', 'Orchestrator');
    }
  };

  const generateChart = async (cards: IssueCard[]) => {
    setPipelineStage(PipelineStage.CHARTS);
    addLog('Generating Analytics Visualization...', 'info', 'Chart Agent');
    try {
      const cardContext = JSON.stringify(cards.map(c => ({ title: c.title, severity: c.severity, areas: c.areas })));
      const jsonStr = await generateAgentContent(
        SYSTEM_INSTRUCTIONS.CHART_GENERATOR,
        `Create a chart config based on these issues: ${cardContext}`
      );
       const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
       const config = JSON.parse(cleanJson);
       setChartConfig(config);
       addLog('Chart generated.', 'success', 'Chart Agent');
    } catch (err) {
       addLog('Failed to generate chart.', 'warning', 'Chart Agent');
    }
    finishPipeline();
  };

  const finishPipeline = () => {
    setPipelineStage(PipelineStage.MARATHON);
    addLog('Pipeline Cycle Complete. Waiting for Video or Restart.', 'success', 'System');
  };

  const handleGenerateVideo = async () => {
    if (pipelineStage < PipelineStage.CARDS) return;
    setIsVideoLoading(true);
    addLog('Initializing Veo 3.1 Video Generation...', 'info', 'Video Agent');
    try {
      const topIssue = issueCards[0];
      const prompt = `A photorealistic, cinematic drone shot of San Francisco, representing the issue: ${topIssue.title}. ${topIssue.description}. High quality, 4k, urban documentary style.`;
      const result = await generateReportVideo(prompt);
      if (result) {
        const apiKey = process.env.API_KEY || '';
        const response = await fetch(`${result.uri}&key=${apiKey}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setVideoUri(blobUrl);
        addLog('Video generated successfully.', 'success', 'Video Agent');
      }
    } catch (err: any) {
      addLog(`Video generation failed: ${err.message}`, 'error', 'Video Agent');
    } finally {
      setIsVideoLoading(false);
    }
  };

  const tabs = [
    { id: "issues", label: "Issue Feed" },
    { id: "process", label: "Process Chart" },
    { id: "log", label: "Agent Log" },
    { id: "forecast", label: "Forecast" },
    { id: "followup", label: "Tracker" },
    { id: "queue", label: "Action Queue" },
  ];

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.paper, minHeight: "100vh", color: C.navy }} className="flex flex-col">
      {/* ── HEADER ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.gray3}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.mint}, ${C.navy})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>LH</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, letterSpacing: -0.3 }}>Lighthouse SF</div>
            <div style={{ fontSize: 10, color: C.gray2, letterSpacing: 0.6 }}>CITY INTELLIGENCE PLATFORM</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[{a:"ps",c:C.ps},{a:"iu",c:C.iu},{a:"lz",c:C.lz}].map(({a,c}) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 10, color: C.gray1, fontWeight: 600 }}>{a.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={startFetch}
            disabled={pipelineStage !== PipelineStage.IDLE && pipelineStage !== PipelineStage.MARATHON}
            style={{ fontSize: 10, color: C.white, background: C.mint, padding: "6px 14px", borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            className="disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md"
          >
             {pipelineStage === PipelineStage.IDLE || pipelineStage === PipelineStage.MARATHON ? <Play size={12} fill="white" /> : <RotateCw size={12} className="animate-spin" />}
             {pipelineStage === PipelineStage.IDLE ? 'START PIPELINE' : pipelineStage === PipelineStage.MARATHON ? 'RESTART' : `STAGE ${pipelineStage} / 9`}
          </button>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ display: "flex", gap: 2, padding: "10px 28px 0", background: C.paper }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            border: "none", background: activeTab === t.id ? C.white : "transparent",
            color: activeTab === t.id ? C.navy : C.gray1, fontSize: 12, fontWeight: activeTab === t.id ? 700 : 500,
            padding: "8px 16px", borderRadius: "8px 8px 0 0", cursor: "pointer",
            boxShadow: activeTab === t.id ? "0 -1px 0 0 white, 0 -2px 4px rgba(0,0,0,0.04)" : "none",
            borderBottom: activeTab === t.id ? `2px solid ${C.mint}` : "2px solid transparent",
            transition: "all 0.15s", letterSpacing: 0.2
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "16px 28px 28px", background: C.white, margin: "0 28px 28px 28px", borderRadius: "0 8px 8px 8px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", minHeight: 480, flex: 1 }}>
        
        {activeTab === "issues" && <IssueFeed cards={issueCards} />}
        {activeTab === "process" && <ProcessChart agents={agents} stage={pipelineStage} />}
        {activeTab === "log" && <AgentLog logs={logs} />}
        {activeTab === "forecast" && <ForecastPanel config={chartConfig} />}
        {activeTab === "followup" && <FollowUpTracker />}
        {activeTab === "queue" && (
           <ActionQueue 
              cards={issueCards} 
              onGenerateVideo={handleGenerateVideo} 
              videoUri={videoUri} 
              isVideoLoading={isVideoLoading} 
            />
        )}

      </div>
    </div>
  );
}
