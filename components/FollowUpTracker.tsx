import React, { useEffect, useState } from 'react';
import { C } from '../constants';
import { Area } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, AlertCircle, ArrowUpRight, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { getPastIssues, type PastIssue } from '../services/cache';

interface FollowUpResult {
  pastIssue: PastIssue;
  status: 'improving' | 'worsening' | 'stagnant' | 'new';
}

interface Props {
  followUpResults?: FollowUpResult[];
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "resolved" || status === "improving") return <CheckCircle size={14} className="text-emerald-500" />;
  if (status === "escalated" || status === "worsening") return <AlertCircle size={14} className="text-red-500" />;
  if (status === "stagnant") return <Minus size={14} className="text-amber-500" />;
  return <Clock size={14} className="text-blue-500" />;
};

const TrendIcon = ({ status }: { status: string }) => {
  if (status === "improving") return <TrendingDown size={12} className="text-emerald-500" />;
  if (status === "worsening") return <TrendingUp size={12} className="text-red-500" />;
  return <Minus size={12} className="text-amber-500" />;
};

const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

export const FollowUpTracker: React.FC<Props> = ({ followUpResults = [] }) => {
  const [trackedIssues, setTrackedIssues] = useState<PastIssue[]>([]);

  useEffect(() => {
    // Load persisted issues on mount and when results change
    const issues = getPastIssues();
    setTrackedIssues(issues);
  }, [followUpResults]);

  // Merge followUpResults status with tracked issues
  const getStatusForIssue = (issue: PastIssue): FollowUpResult['status'] => {
    const result = followUpResults.find(r => r.pastIssue.id === issue.id);
    if (result) return result.status;
    return issue.status === 'escalated' ? 'worsening' :
      issue.status === 'resolved' ? 'improving' : 'stagnant';
  };

  if (trackedIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white/50">
        <RefreshCw size={32} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">No tracked issues yet</p>
        <p className="text-xs mt-1">Issues from previous pipeline runs will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Follow-Up Tracker</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
            {trackedIssues.length} tracked
          </span>
        </div>
        <span style={{ fontSize: 9, color: C.gray2, background: C.paper, padding: "3px 8px", borderRadius: 8 }}>Stage 7 · Marathon Mode</span>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Improving', status: 'improving', color: 'emerald', icon: TrendingDown },
          { label: 'Stagnant', status: 'stagnant', color: 'amber', icon: Minus },
          { label: 'Worsening', status: 'worsening', color: 'red', icon: TrendingUp },
        ].map(({ label, status, color, icon: Icon }) => {
          const count = trackedIssues.filter(i => getStatusForIssue(i) === status).length;
          return (
            <div key={status} className={`p-3 rounded-lg border bg-${color}-50 border-${color}-100`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={12} className={`text-${color}-500`} />
                <span className={`text-[10px] font-bold text-${color}-600 uppercase tracking-wide`}>{label}</span>
              </div>
              <span className={`text-xl font-bold text-${color}-700`}>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {trackedIssues.slice(0, 10).map((item) => {
          const status = getStatusForIssue(item);
          let areaColor = C.navy;
          const firstArea = item.areas[0] as string;
          if (firstArea?.includes('Safety')) areaColor = C.ps;
          if (firstArea?.includes('Infrastructure')) areaColor = C.iu;

          return (
            <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-1 h-10 rounded-full" style={{ background: areaColor }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {firstArea?.split(' ')[0] || 'ISSUE'}
                  </span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">{formatTimeAgo(item.createdAt)}</span>
                  {item.lastChecked !== item.createdAt && (
                    <>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-blue-400">checked {formatTimeAgo(item.lastChecked)}</span>
                    </>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${status === 'improving' ? 'bg-emerald-50 border-emerald-100' :
                    status === 'worsening' ? 'bg-red-50 border-red-100' :
                      'bg-amber-50 border-amber-100'
                  }`}>
                  <StatusIcon status={status} />
                  <span className={`text-[9px] font-semibold ${status === 'improving' ? 'text-emerald-600' :
                      status === 'worsening' ? 'text-red-600' :
                        'text-amber-600'
                    }`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
              </div>

              {item.trendData && item.trendData.length > 1 && (
                <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.trendData.map((v, i) => ({ v, i }))}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={status === 'worsening' ? C.pink : status === 'improving' ? C.mint : '#f59e0b'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <TrendIcon status={status} />
            </div>
          );
        })}
      </div>

      {trackedIssues.length > 10 && (
        <div className="text-center text-xs text-slate-400 mt-4">
          Showing 10 of {trackedIssues.length} tracked issues
        </div>
      )}
    </div>
  );
};
