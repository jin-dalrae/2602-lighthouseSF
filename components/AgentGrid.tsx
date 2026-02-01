import React from 'react';
import { Agent, AgentStatus, Area } from '../types';
import { Shield, Hammer, Map, Database, Newspaper, Building2, Loader2, Check, AlertTriangle } from 'lucide-react';

interface Props {
  agents: Agent[];
}

const getAreaIcon = (area: Area) => {
  switch (area) {
    case Area.PS: return Shield;
    case Area.IU: return Hammer;
    case Area.LZ: return Map;
  }
};

const getTypeIcon = (name: string) => {
  if (name.includes('SODA')) return Database;
  if (name.includes('News')) return Newspaper;
  return Building2;
};

export const AgentGrid: React.FC<Props> = ({ agents }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {agents.map((agent) => {
        const AreaIcon = getAreaIcon(agent.area);
        const TypeIcon = getTypeIcon(agent.name);
        
        let statusColor = 'border-slate-700 bg-slate-800/50';
        if (agent.status === AgentStatus.FETCHING) statusColor = 'border-blue-500/50 bg-blue-900/10 animate-pulse';
        if (agent.status === AgentStatus.ANALYZING) statusColor = 'border-purple-500/50 bg-purple-900/10 animate-pulse';
        if (agent.status === AgentStatus.DONE) statusColor = 'border-emerald-500/50 bg-emerald-900/10';
        if (agent.status === AgentStatus.ERROR) statusColor = 'border-red-500/50 bg-red-900/10';

        return (
          <div key={agent.id} className={`p-3 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${statusColor}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <AreaIcon size={14} className="text-slate-400" />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{agent.area.split(' ')[0]}</span>
              </div>
              {agent.status === AgentStatus.FETCHING || agent.status === AgentStatus.ANALYZING ? (
                <Loader2 size={14} className="animate-spin text-blue-400" />
              ) : agent.status === AgentStatus.DONE ? (
                <Check size={14} className="text-emerald-400" />
              ) : agent.status === AgentStatus.ERROR ? (
                <AlertTriangle size={14} className="text-red-400" />
              ) : null}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-700/50 rounded-md text-slate-200">
                <TypeIcon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-100">{agent.name}</span>
                <span className="text-[10px] text-slate-500 capitalize">{agent.status}</span>
              </div>
            </div>

            {agent.lastMessage && (
               <div className="mt-1 text-[10px] text-slate-400 truncate border-t border-slate-700/50 pt-1">
                 {agent.lastMessage}
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
