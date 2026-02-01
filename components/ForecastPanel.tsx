
import React, { useState } from 'react';
import { ChartConfig } from '../types';
import { C } from '../constants';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Props {
  config: ChartConfig | null;
}

export const ForecastPanel: React.FC<Props> = ({ config: rootConfig }) => {
  const [selectedArea, setSelectedArea] = useState("All");
  
  if (!rootConfig) return (
    <div className="h-64 flex items-center justify-center text-gray-400 bg-white/50 rounded-lg border border-dashed border-gray-200">
       Waiting for data...
    </div>
  );

  const { chart_type, config, data } = rootConfig;

  const renderChart = () => {
     const commonProps = {
        data: data,
        margin: { top: 10, right: 10, left: 0, bottom: 0 }
     };

     const commonAxis = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gray3} vertical={false} />
            <XAxis dataKey={config.xKey} tick={{ fontSize: 10, fill: C.gray1 }} axisLine={{ stroke: C.gray3 }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.gray1 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.gray3}`, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </>
     );

     // Map generic types or new types to Recharts components
     if (chart_type === 'line' || chart_type === 'time_series') {
         return (
             <LineChart {...commonProps}>
                 {commonAxis}
                 {config.yKeys.map((k, i) => (
                     <Line key={k.key} type="monotone" dataKey={k.key} stroke={k.color} strokeWidth={2.5} dot={{ r: 3 }} name={k.label} />
                 ))}
                 {config.forecast_overlay && <Line type="monotone" dataKey="forecast" stroke={C.gray2} strokeDasharray="3 3" strokeWidth={2} dot={false} name="Forecast" />}
             </LineChart>
         );
     }
     if (chart_type === 'bar') {
         return (
             <BarChart {...commonProps}>
                 {commonAxis}
                 {config.yKeys.map((k, i) => (
                     <Bar key={k.key} dataKey={k.key} fill={k.color} radius={[4, 4, 0, 0]} name={k.label} />
                 ))}
             </BarChart>
         );
     }
     if (chart_type === 'area') {
         return (
             <AreaChart {...commonProps}>
                 {commonAxis}
                 {config.yKeys.map((k, i) => (
                     <Area key={k.key} type="monotone" dataKey={k.key} stroke={k.color} fill={k.color} fillOpacity={0.3} name={k.label} />
                 ))}
             </AreaChart>
         );
     }
     // Default fallback to ComposedChart for complex types or explicitly 'composed'
     return (
        <ComposedChart {...commonProps}>
             {commonAxis}
             {config.yKeys.map((k, i) => (
                 <Bar key={k.key} dataKey={k.key} fill={k.color} radius={[4, 4, 0, 0]} name={k.label} />
             ))}
             {config.forecast_overlay && <Line type="monotone" dataKey="forecast" stroke={C.gray2} strokeDasharray="3 3" strokeWidth={2} dot={false} name="Forecast" />}
        </ComposedChart>
     );
  };
  
  const AreaTab = ({ label, id }: { label: string, id: string }) => {
      const active = selectedArea === id;
      const baseStyle = "text-[10px] font-bold px-3 py-1 rounded-full transition-colors cursor-pointer";
      const activeStyle = "bg-slate-800 text-white";
      const inactiveStyle = "bg-slate-100 text-slate-400 hover:bg-slate-200";
      return (
          <button onClick={() => setSelectedArea(id)} className={`${baseStyle} ${active ? activeStyle : inactiveStyle}`}>
            {label}
          </button>
      );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="flex flex-col gap-1">
             <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{rootConfig.title}</span>
             <div className="flex gap-2">
                <AreaTab label="All Areas" id="All" />
                <AreaTab label="Public Safety" id="PS" />
                <AreaTab label="Infra" id="IU" />
                <AreaTab label="Zoning" id="LZ" />
             </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
             {config.forecast_overlay && <span style={{ fontSize: 9, color: C.mint, background: C.mintLight, padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>Forecast Active</span>}
        </div>
      </div>
      <div style={{ height: 240, background: C.white, borderRadius: 8, padding: 10, border: `1px solid ${C.gray3}` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 10, fontSize: 9, color: C.gray2, textAlign: 'center' }}>
          Data synthesized from multi-agent pipeline sources.
      </div>
    </div>
  );
};
