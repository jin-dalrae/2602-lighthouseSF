import React from 'react';
import { LogEntry, Area } from '../types';
import { C } from '../constants';

interface Props {
  logs: LogEntry[];
}

export const AgentLog: React.FC<Props> = ({ logs }) => {
  const reversedLogs = [...logs].reverse();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Agent Thought Log</span>
        <span style={{ fontSize: 9, color: C.gray2, background: C.paper, padding: "3px 8px", borderRadius: 8 }}>Live · updating</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: '600px', overflowY: 'auto' }}>
        {reversedLogs.map((entry, i) => {
           // Simple heuristic to map source to color
           let bgColor = C.navy;
           if (entry.source.includes('PS')) bgColor = C.ps;
           if (entry.source.includes('IU')) bgColor = C.iu;
           if (entry.source.includes('LZ')) bgColor = C.lz;
           if (entry.source === 'Orchestrator') bgColor = C.navy;
           if (entry.source === 'System') bgColor = C.gray1;

           const isTop = i === 0;

          return (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: 8, background: isTop ? C.mintLight : "transparent", border: isTop ? `1px solid ${C.mintMid}` : "1px solid transparent", transition: "background 0.2s" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 52 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: C.white, fontSize: 9, fontWeight: 700 }}>{entry.source.substring(0, 2)}</span>
                </div>
                <span style={{ fontSize: 7.5, color: C.gray2, marginTop: 3 }}>{entry.timestamp}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{entry.type.toUpperCase()}</div>
                <div style={{ fontSize: 10, color: C.gray1, marginTop: 2, fontFamily: "monospace", background: C.paper, padding: "3px 8px", borderRadius: 4, display: "inline-block" }}>{entry.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
