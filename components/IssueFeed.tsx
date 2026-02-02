import React, { useState } from 'react';
import { Area } from '../types';
import { StoredIssue } from '../services/firebase';
import { C } from '../constants';
import { SlidersHorizontal, ArrowDown, ArrowUp, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
  cards: StoredIssue[];
  onCardClick?: (issue: StoredIssue) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type SortType = 'severity' | 'horizon' | 'cross-area' | 'date';

const AreaBadge: React.FC<{ area: Area, size?: "sm" | "xs" }> = ({ area, size = "sm" }) => {
  const map = {
    [Area.PS]: { label: "PS", color: C.ps, bg: C.psLight },
    [Area.IU]: { label: "IU", color: C.iu, bg: C.iuLight },
    [Area.LZ]: { label: "LZ", color: C.lz, bg: C.lzLight }
  };
  const a = map[area];
  if (!a) return null;
  const px = size === "xs" ? "4px 8px" : "5px 12px";
  const fs = size === "xs" ? 9 : 11;
  return (
    <span style={{
      display: "inline-block",
      background: a.bg,
      color: a.color,
      fontSize: fs,
      fontWeight: 700,
      padding: px,
      borderRadius: 20,
      letterSpacing: 0.3,
      marginRight: 4
    }}>
      {a.label}
    </span>
  );
}

const severityValue = (s: string) => {
  switch (s) {
    case 'Critical': return 4;
    case 'High': return 3;
    case 'Medium': return 2;
    default: return 1;
  }
};

const horizonValue = (h: string) => {
  if (h.includes('wk')) return 1;
  if (h.includes('30d')) return 2;
  if (h.includes('90d')) return 3;
  if (h.includes('1yr')) return 4;
  if (h.includes('5yr')) return 5;
  return 6;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#FEF3C7', text: '#D97706' },
  monitoring: { bg: '#E0F2FE', text: '#0284C7' },
  resolved: { bg: '#D1FAE5', text: '#059669' }
};

export const IssueFeed: React.FC<Props> = ({ cards, onCardClick, onRefresh, isLoading }) => {
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortDesc, setSortDesc] = useState(true);

  const sortedCards = [...cards].sort((a, b) => {
    let diff = 0;
    if (sortType === 'severity') {
      diff = severityValue(a.severity) - severityValue(b.severity);
    } else if (sortType === 'horizon') {
      diff = horizonValue(a.time_horizon) - horizonValue(b.time_horizon);
    } else if (sortType === 'cross-area') {
      const aVal = (a.cross_area || a.areas.length > 1) ? 1 : 0;
      const bVal = (b.cross_area || b.areas.length > 1) ? 1 : 0;
      diff = aVal - bVal;
    } else if (sortType === 'date') {
      diff = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    return sortDesc ? diff * -1 : diff;
  });

  const handleSort = (type: SortType) => {
    if (sortType === type) {
      setSortDesc(!sortDesc);
    } else {
      setSortType(type);
      setSortDesc(true);
    }
  };

  const SortButton = ({ type, label }: { type: SortType, label: string }) => {
    const active = sortType === type;
    return (
      <button
        onClick={() => handleSort(type)}
        className={`text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${active ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
      >
        {label}
        {active && (sortDesc ? <ArrowDown size={10} /> : <ArrowUp size={10} />)}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <Loader2 size={24} className="animate-spin mb-2" />
        <p>Loading issues...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white/50">
        <p>No issues found. Run the pipeline to detect city issues.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Issue Archive</span>
          <span style={{ fontSize: 10, color: C.gray2 }}>{cards.length} total</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Refresh issues"
            >
              <RefreshCw size={14} color={C.gray2} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
          <SlidersHorizontal size={12} className="text-slate-400 mx-1" />
          <SortButton type="date" label="Latest" />
          <SortButton type="severity" label="Urgency" />
          <SortButton type="cross-area" label="Cross-Area" />
          <SortButton type="horizon" label="Horizon" />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sortedCards.map((issue, index) => {
          const isCross = issue.cross_area || issue.areas.length > 1;
          const confidence = issue.confidence;
          const status = issue.status || 'active';
          const statusStyle = statusColors[status];

          return (
            <div
              key={`${issue.id}-${index}`}
              onClick={() => onCardClick?.(issue)}
              style={{
                border: `1px solid ${isCross ? C.mintMid : C.gray3}`,
                borderLeft: `3px solid ${isCross ? C.mint : C.gray3}`,
                borderRadius: 10, padding: "14px 16px", background: isCross ? C.mintLight : C.white,
                transition: "box-shadow 0.15s, transform 0.15s", cursor: "pointer"
              }}
              className="hover:shadow-md transition-shadow group animate-in slide-in-from-bottom-2 duration-500"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {isCross && <span style={{ fontSize: 8, background: C.mint, color: C.white, padding: "2px 6px", borderRadius: 4, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Cross-Area</span>}
                  <span style={{
                    fontSize: 8,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>{status}</span>
                  <div className="flex">
                    {issue.areas.map(a => <AreaBadge key={a} area={a} size="xs" />)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {issue.createdAt && (
                    <span style={{ fontSize: 9, color: C.gray2 }}>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  <span style={{ fontSize: 9, color: C.gray2, background: C.paper, padding: "2px 8px", borderRadius: 10 }}>{issue.time_horizon}</span>
                  <span style={{ fontSize: 9, color: confidence === "High" ? C.mint : confidence === "Medium" ? "#D4A017" : C.gray2, fontWeight: 600 }}>{confidence} Conf.</span>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 5, lineHeight: 1.3 }}>{issue.title}</div>
              <div style={{ fontSize: 11, color: C.gray1, lineHeight: 1.5 }}>{issue.summary}</div>

              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.paper}`, display: "flex", gap: 12 }}>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">1Y Forecast</span>
                  <span className="text-[10px] text-slate-600 leading-tight">{issue.forecast?.["1y"] || '-'}</span>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">5Y Forecast</span>
                  <span className="text-[10px] text-slate-600 leading-tight">{issue.forecast?.["5y"] || '-'}</span>
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 8, background: C.paper, color: C.gray1, padding: "2px 6px", borderRadius: 6, fontWeight: 600 }}>Action: {issue.action_item}</span>
                <span style={{ fontSize: 8, color: C.mint, marginLeft: 'auto', fontWeight: 600 }}>Click for details →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
