import React from 'react';
import { C } from '../constants';
import { Area } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

// Mock data for follow-up logic
const TRACKED_ITEMS = [
  { id: 101, title: "Mission Dist. Flood Risk", area: Area.IU, status: "Monitoring", date: "2 days ago", trend: [65, 59, 80, 81, 56, 55, 40] },
  { id: 102, title: "Tenderloin Safety Spike", area: Area.PS, status: "Escalated", date: "5 days ago", trend: [28, 48, 40, 19, 86, 27, 90] },
  { id: 103, title: "Sunset Rezoning Permits", area: Area.LZ, status: "Resolved", date: "1 week ago", trend: [18, 48, 77, 9, 100, 27, 14] },
  { id: 104, title: "Market St. Potholes", area: Area.IU, status: "Monitoring", date: "1 week ago", trend: [65, 59, 80, 81, 56, 55, 60] },
  { id: 105, title: "Downtown Retail Vacancy", area: Area.LZ, status: "Monitoring", date: "2 weeks ago", trend: [40, 42, 45, 48, 50, 52, 53] },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "Resolved") return <CheckCircle size={14} className="text-emerald-500" />;
  if (status === "Escalated") return <AlertCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-amber-500" />;
};

export const FollowUpTracker: React.FC = () => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Follow-Up Tracker</span>
        <span style={{ fontSize: 9, color: C.gray2, background: C.paper, padding: "3px 8px", borderRadius: 8 }}>Past Issues</span>
      </div>

      <div className="flex flex-col gap-3">
        {TRACKED_ITEMS.map((item) => {
            let areaColor = C.navy;
            if (item.area === Area.PS) areaColor = C.ps;
            if (item.area === Area.IU) areaColor = C.iu;

            return (
              <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                 <div className="w-1 h-8 rounded-full" style={{ background: areaColor }} />
                 
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.area.split(' ')[0]}</span>
                     <span className="text-[10px] text-slate-300">•</span>
                     <span className="text-[10px] text-slate-400">{item.date}</span>
                   </div>
                   <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
                 </div>

                 <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                       <StatusIcon status={item.status} />
                       <span className="text-[9px] font-semibold text-slate-600">{item.status}</span>
                    </div>
                 </div>

                 <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={item.trend.map((v, i) => ({ v, i }))}>
                       <Line type="monotone" dataKey="v" stroke={item.status === 'Escalated' ? C.pink : item.status === 'Resolved' ? C.mint : '#f59e0b'} strokeWidth={2} dot={false} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
                 
                 <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-400" />
              </div>
            );
        })}
      </div>
    </div>
  );
};
