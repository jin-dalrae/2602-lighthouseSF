import React from 'react';
import { IssueCard, Area } from '../types';
import { C } from '../constants';
import { Video } from 'lucide-react';

interface Props {
  cards: IssueCard[];
  onGenerateVideo: () => void;
  videoUri: string | null;
  isVideoLoading: boolean;
}

const AreaDot: React.FC<{ area: Area }> = ({ area }) => {
    const map = { 
        [Area.PS]: C.ps, 
        [Area.IU]: C.iu, 
        [Area.LZ]: C.lz 
    };
    return <div style={{ width: 8, height: 8, borderRadius: "50%", background: map[area] || C.gray1 }} title={area} />;
}

export const ActionQueue: React.FC<Props> = ({ cards, onGenerateVideo, videoUri, isVideoLoading }) => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Action Queue</span>
        <span style={{ fontSize: 9, color: C.gray2, background: C.paper, padding: "3px 8px", borderRadius: 8 }}>Marathon loop · Auto-restart</span>
      </div>
      
      {/* Video Generation Highlight */}
      <div style={{ marginBottom: 20, padding: 16, background: C.navy, borderRadius: 10, color: C.white }}>
         <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Video size={14} /> VEO 3.1 SYNTHESIS</h3>
                <p className="text-[10px] text-gray-400 mt-1">Generate a cinematic brief of the top priority issue.</p>
             </div>
             {videoUri && <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">READY</span>}
         </div>

         {videoUri ? (
             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 mb-4">
                <video src={videoUri} controls autoPlay loop className="w-full h-full object-cover" />
             </div>
         ) : (
             <button 
                onClick={onGenerateVideo}
                disabled={cards.length === 0 || isVideoLoading}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-bold transition-colors"
                style={{ background: C.mint }}
             >
                {isVideoLoading ? 'Generating...' : 'Generate Video Brief'}
             </button>
         )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cards.map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.white, borderRadius: 10, border: `1px solid ${item.severity === "Critical" ? C.pinkMid : C.gray3}`, borderLeft: `3px solid ${item.severity === "Critical" ? C.pink : C.gray3}` }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ border: "none", background: C.mint, color: C.white, fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}>▶ Dive</button>
              <button style={{ border: `1px solid ${C.gray3}`, background: C.paper, color: C.gray1, fontSize: 9, padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{item.title}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
                <span style={{ fontSize: 8.5, color: C.gray2 }}>Action: {item.action_item}</span>
                <div className="flex gap-1">
                   {item.areas.map(a => <AreaDot key={a} area={a} />)}
                </div>
                {item.severity === "Critical" && <span style={{ fontSize: 8, color: C.pink, fontWeight: 700 }}>HIGH</span>}
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && <div className="text-center text-xs text-gray-400 py-4">No actions queued.</div>}
      </div>
    </div>
  );
};
