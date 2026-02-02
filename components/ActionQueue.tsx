import React, { useState, useEffect } from 'react';
import { IssueCard, Area } from '../types';
import { C } from '../constants';
import { Video, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  cards: IssueCard[];
  onGenerateVideo: () => void;
  videoUris: string[];
  isVideoLoading: boolean;
  videoProgress?: string;
}

const AreaDot: React.FC<{ area: Area }> = ({ area }) => {
  const map = {
    [Area.PS]: C.ps,
    [Area.IU]: C.iu,
    [Area.LZ]: C.lz
  };
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: map[area] || C.gray1 }} title={area} />;
}

export const ActionQueue: React.FC<Props> = ({ cards, onGenerateVideo, videoUris, isVideoLoading, videoProgress }) => {
  const [activeClip, setActiveClip] = useState(0);

  useEffect(() => {
    if (videoUris.length > 0 && activeClip >= videoUris.length) {
      setActiveClip(0);
    }
  }, [videoUris, activeClip]);

  const handleVideoEnd = () => {
    if (activeClip < videoUris.length - 1) {
      setActiveClip(activeClip + 1);
    } else {
      setActiveClip(0); // Loop back or stop? Let's loop for now.
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Action Queue</span>
        <span style={{ fontSize: 9, color: C.gray2, background: C.paper, padding: "3px 8px", borderRadius: 8 }}>VEO 3.1 Synthesis Engine</span>
      </div>

      {/* Video Generation Highlight */}
      <div style={{ marginBottom: 20, padding: 16, background: C.navy, borderRadius: 12, color: C.white, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Video size={14} className="text-indigo-400" /> MULTI-PART VIDEO REPORT</h3>
            <p className="text-[10px] text-gray-400 mt-1">
              {isVideoLoading ? videoProgress : videoUris.length > 0 ? `Cinematic Brief: ${videoUris.length} clips synthesized.` : 'Synthesize a multi-part cinematic brief of the top priority issue.'}
            </p>
          </div>
          {videoUris.length === 3 && <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Complete</span>}
          {isVideoLoading && <Loader2 size={14} className="animate-spin text-indigo-400" />}
        </div>

        {videoUris.length > 0 ? (
          <div className="relative group">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 mb-2">
              <video
                key={videoUris[activeClip]}
                src={videoUris[activeClip]}
                controls
                autoPlay
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Playlist Controls */}
            <div className="flex items-center justify-between px-1">
              <div className="flex gap-1">
                {videoUris.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveClip(i)}
                    style={{
                      width: 24,
                      height: 3,
                      borderRadius: 2,
                      background: i === activeClip ? C.mint : (i < videoUris.length ? '#4A5568' : '#2D3748'),
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveClip(prev => Math.max(0, prev - 1))}
                  disabled={activeClip === 0}
                  className="text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-mono text-gray-400">PART {activeClip + 1} OF {videoUris.length}</span>
                <button
                  onClick={() => setActiveClip(prev => Math.min(videoUris.length - 1, prev + 1))}
                  disabled={activeClip === videoUris.length - 1}
                  className="text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {!isVideoLoading && videoUris.length < 3 && (
              <div className="mt-4 p-2 bg-white/5 rounded text-[9px] text-gray-400 italic">
                Generating remaining clips... ({videoUris.length}/3 ready)
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onGenerateVideo}
            disabled={cards.length === 0 || isVideoLoading}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.mint}, #10b981)` }}
          >
            {isVideoLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {videoProgress || 'Generating...'}
              </>
            ) : 'Generate Multi-Part Video Brief'}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="px-1 mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority Actions</span>
        </div>
        {cards.map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.white, borderRadius: 10, border: `1px solid ${item.severity === "Critical" ? C.pinkMid : C.gray3}`, borderLeft: `3px solid ${item.severity === "Critical" ? C.pink : C.gray3}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ border: "none", background: C.mint, color: C.white, fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer", transition: 'opacity 0.2s' }} className="hover:opacity-80">▶ Dive</button>
              <button style={{ border: `1px solid ${C.gray3}`, background: C.paper, color: C.gray1, fontSize: 9, padding: "4px 8px", borderRadius: 6, cursor: "pointer" }} className="hover:bg-gray-100">✕</button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{item.title}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: C.gray2 }}>{item.action_item}</span>
                <div className="flex gap-1 ml-auto">
                  {item.areas.map(a => <AreaDot key={a} area={a} />)}
                </div>
                {item.severity === "Critical" && <span style={{ fontSize: 8, color: C.pink, fontWeight: 800 }}>CRITICAL</span>}
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && <div className="text-center text-xs text-gray-400 py-6 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">No priority actions in queue.</div>}
      </div>
    </div>
  );
};
