import React from 'react';
import { ChartConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface Props {
  config: ChartConfig | null;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const ChartPanel: React.FC<Props> = ({ config }) => {
  if (!config) return null;

  return (
    <div className="w-full h-64 bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{config.title}</h3>
      <div className="w-full h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          {config.type === 'line' ? (
             <LineChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{r: 4, fill: '#3b82f6'}} />
             </LineChart>
          ) : (
             <BarChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.2}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {config.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
             </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
