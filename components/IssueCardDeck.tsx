import React from 'react';
import { IssueCard, Area } from '../types';
import { C } from '../constants';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Props {
  cards: IssueCard[];
}

const getSeverityColor = (sev: string) => {
  switch (sev.toLowerCase()) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    default: return 'bg-blue-500';
  }
};

const getAreaColor = (area: Area) => {
  switch (area) {
    case Area.PS: return 'text-red-400';
    case Area.IU: return 'text-orange-400';
    case Area.LZ: return 'text-emerald-400';
  }
};

export const IssueCardDeck: React.FC<Props> = ({ cards }) => {
  if (cards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl p-8">
        <Info size={32} className="mb-2 opacity-50" />
        <p>Awaiting Intelligence Generation...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in">
      {cards.map((card) => (
        <div key={card.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group">
          <div className="flex h-full">
            <div className={`w-1.5 ${getSeverityColor(card.severity)}`} />
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                {/* Fixed: Use card.areas[0] instead of card.area */}
                <span className={`text-[10px] font-bold uppercase tracking-widest ${getAreaColor(card.areas[0])}`}>
                  {card.areas.map(a => a.split(' ')[0]).join(' + ')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300`}>
                  {card.severity}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2 leading-tight">{card.title}</h3>
              {/* Fixed: Use card.summary instead of card.description */}
              <p className="text-xs text-slate-400 mb-4 line-clamp-3">{card.summary}</p>

              <div className="border-t border-slate-700/50 pt-3 mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-slate-500 font-mono">SOURCES:</span>
                  <div className="flex gap-1 flex-wrap">
                    {/* Fixed: Use card.data_refs instead of card.sources */}
                    {card.data_refs.slice(0, 3).map(s => (
                      <span key={s} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                        {s.length > 20 ? s.slice(0, 20) + '...' : s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-2 border border-slate-800/50 flex gap-2">
                  <AlertCircle size={12} className="text-blue-400 shrink-0 mt-0.5" />
                  {/* Fixed: Use card.action_item instead of card.actionItem */}
                  <span className="text-[10px] text-blue-200/80 font-mono">{card.action_item}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
