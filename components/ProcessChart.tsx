import React, { useState, useEffect } from 'react';
import { Agent, AgentStatus, Area, AgentType } from '../types';
import { C } from '../constants';

interface Props {
  agents: Agent[];
  stage: number; // PipelineStage
}

// Consolidator definitions for the graph
const CONSOLIDATORS = [
  { id: "c-ps", label: "PS Consolidator", area: Area.PS, x: 80 },
  { id: "c-iu", label: "IU Consolidator", area: Area.IU, x: 280 },
  { id: "c-lz", label: "LZ Consolidator", area: Area.LZ, x: 480 },
];

export const ProcessChart: React.FC<Props> = ({ agents, stage }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 800); return () => clearInterval(t); }, []);

  const areaColor = { [Area.PS]: C.ps, [Area.IU]: C.iu, [Area.LZ]: C.lz };
  const typeColor = { [AgentType.DATA]: C.mint, [AgentType.NEWS]: C.pink, [AgentType.GOV]: C.navy };
  const cols = { [Area.PS]: 80, [Area.IU]: 280, [Area.LZ]: 480 };
  const rows = { [AgentType.DATA]: 70, [AgentType.NEWS]: 150, [AgentType.GOV]: 230 };
  
  const consY = 320;
  const orchPos = { x: 280, y: 400 };
  const chartPos = { x: 420, y: 400 };
  const videoPos = { x: 540, y: 400 };
  
  const pulse = (tick % 3) === 0;

  // Helper to fix X positions based on snippet logic: cols[area] + typeIdx * 55
  const getAgentX = (a: Agent) => {
    const typeIdx = a.type === AgentType.DATA ? 0 : a.type === AgentType.NEWS ? 1 : 2;
    return cols[a.area] + typeIdx * 55;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
    <svg viewBox="0 0 680 470" style={{ width: "100%", height: "100%", maxHeight: 380 }}>
      {/* Area group backgrounds */}
      {[Area.PS, Area.IU, Area.LZ].map(area => (
        <rect key={area} x={cols[area] - 18} y={40} width={175} height={300} rx={12} fill={areaColor[area]} fillOpacity={0.06} />
      ))}
      
      {/* Area labels */}
      {[
        {k:Area.PS, l:"Public Safety"},
        {k:Area.IU, l:"Infra & Util"},
        {k:Area.LZ, l:"Land Use"}
      ].map(({k,l}) => (
        <text key={k} x={cols[k] + 58} y={58} textAnchor="middle" fill={areaColor[k]} fontSize={10} fontWeight={700} fontFamily="'DM Sans', sans-serif" letterSpacing={0.8}>{l.toUpperCase()}</text>
      ))}

      {/* Source type labels (left side) */}
      {[["Data",70],["News",150],["Gov",230]].map(([l,y]) => (
        <text key={String(l)} x={22} y={Number(y) + 14} textAnchor="start" fill={C.gray1} fontSize={9} fontWeight={600} fontFamily="'DM Sans', sans-serif">{l}</text>
      ))}

      {/* Edges: agents -> consolidators */}
      {agents.map(a => {
        const c = CONSOLIDATORS.find(c => c.area === a.area);
        if(!c) return null;
        const ax = getAgentX(a);
        const ay = rows[a.type];
        return <line key={`e-${a.id}`} x1={ax} y1={ay + 18} x2={c.x + 55} y2={consY - 18} stroke={C.gray3} strokeWidth={1.5} />;
      })}

      {/* Edges: consolidators -> orchestrator */}
      {CONSOLIDATORS.map(c => {
         const isActive = stage >= 3; 
         return (
          <line key={`ec-${c.id}`} x1={c.x + 55} y1={consY + 18} x2={orchPos.x} y2={orchPos.y - 16} stroke={C.gray3} strokeWidth={1.5} strokeDasharray={!isActive ? "4 3" : "none"} />
        );
      })}

      {/* Orchestrator -> Chart */}
      <line x1={orchPos.x + 44} y1={orchPos.y} x2={chartPos.x - 30} y2={chartPos.y} stroke={C.gray3} strokeWidth={1.5} />
      {/* Orchestrator -> Video (logical flow visually connected via chart for layout simplicity or direct) */}
      <line x1={chartPos.x + 30} y1={chartPos.y} x2={videoPos.x - 30} y2={videoPos.y} stroke={C.gray3} strokeWidth={1.5} strokeDasharray="3 3" />

      {/* Cross-area edges */}
      {CONSOLIDATORS.map((c, i) => CONSOLIDATORS.slice(i + 1).map(c2 => (
        <line key={`cx-${c.id}-${c2.id}`} x1={c.x + 55 + 18} y1={consY} x2={c2.x + 55 - 18} y2={consY} stroke={C.mint} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
      )))}

      {/* Agent nodes (1-9) */}
      {agents.map(a => {
        const ax = getAgentX(a);
        const ay = rows[a.type];
        const isRunning = a.status === AgentStatus.FETCHING || a.status === AgentStatus.ANALYZING;
        const isDone = a.status === AgentStatus.DONE;
        const isWait = a.status === AgentStatus.IDLE;
        
        const fill = isDone ? typeColor[a.type] : isRunning ? typeColor[a.type] : C.gray3;
        const opacity = isWait ? 0.4 : 1;

        return (
          <g key={`a-${a.id}`} opacity={opacity} className="transition-all duration-500">
            {isRunning && <circle cx={ax} cy={ay} r={22} fill={typeColor[a.type]} fillOpacity={pulse ? 0.15 : 0.08} style={{ transition: "fill-opacity 0.4s" }} />}
            <circle cx={ax} cy={ay} r={16} fill={fill} />
            <text x={ax} y={ay + 4} textAnchor="middle" fill={C.white} fontSize={9} fontWeight={700} fontFamily="'DM Sans', sans-serif">{a.id}</text>
            {isDone && <text x={ax} y={ay + 30} textAnchor="middle" fill={C.gray1} fontSize={7.5} fontFamily="'DM Sans', sans-serif">Done</text>}
            {isRunning && <text x={ax} y={ay + 30} textAnchor="middle" fill={typeColor[a.type]} fontSize={7.5} fontFamily="'DM Sans', sans-serif" fontWeight={600}>run</text>}
          </g>
        );
      })}

      {/* Consolidator nodes (10-12) */}
      {CONSOLIDATORS.map(c => {
        const isDone = stage > 3; 
        const isWait = stage < 3;
        const cx = c.x + 55;
        return (
          <g key={c.id} opacity={isWait ? 0.35 : 1}>
            <rect x={cx - 32} y={consY - 16} width={64} height={32} rx={8} fill={isDone ? areaColor[c.area] : C.gray3} />
            <text x={cx} y={consY + 1} textAnchor="middle" fill={C.white} fontSize={8} fontWeight={700} fontFamily="'DM Sans', sans-serif">{c.area.split(' ')[0].toUpperCase()}</text>
            <text x={cx} y={consY + 11} textAnchor="middle" fill={C.white} fontSize={6.5} fontFamily="'DM Sans', sans-serif" opacity={0.85}>CONSOLIDATOR</text>
          </g>
        );
      })}

      {/* Orchestrator (13) */}
      <g opacity={stage >= 5 ? 1 : 0.5}>
        <rect x={orchPos.x - 44} y={orchPos.y - 18} width={88} height={36} rx={10} fill={C.navy} />
        <text x={orchPos.x} y={orchPos.y + 2} textAnchor="middle" fill={C.white} fontSize={9} fontWeight={700} fontFamily="'DM Sans', sans-serif">ORCHESTRATOR</text>
        <text x={orchPos.x} y={orchPos.y + 13} textAnchor="middle" fill={C.mintLight} fontSize={6.5} fontFamily="'DM Sans', sans-serif">Gemini 2.5 Pro</text>
      </g>

      {/* Chart Agent (14) */}
      <g opacity={stage >= 6 ? 1 : 0.5}>
         <rect x={chartPos.x - 30} y={chartPos.y - 15} width={60} height={30} rx={8} fill={C.mint} />
         <text x={chartPos.x} y={chartPos.y + 4} textAnchor="middle" fill={C.white} fontSize={8} fontWeight={700} fontFamily="'DM Sans', sans-serif">CHART</text>
      </g>

      {/* Video Agent (15) */}
      <g opacity={stage >= 8 ? 1 : 0.5}>
         <rect x={videoPos.x - 30} y={videoPos.y - 15} width={60} height={30} rx={8} fill={C.pink} />
         <text x={videoPos.x} y={videoPos.y + 4} textAnchor="middle" fill={C.white} fontSize={8} fontWeight={700} fontFamily="'DM Sans', sans-serif">VIDEO</text>
      </g>

      {/* Legend */}
      {[["Data", C.mint],["News", C.pink],["Gov", C.navy]].map(([l,c], i) => (
        <g key={String(l)} transform={`translate(${520 + i * 55}, 50)`}>
          <circle cx={6} cy={6} r={5} fill={String(c)} />
          <text x={14} y={10} fill={C.gray1} fontSize={8} fontFamily="'DM Sans', sans-serif">{l}</text>
        </g>
      ))}
    </svg>
    </div>
  );
};
