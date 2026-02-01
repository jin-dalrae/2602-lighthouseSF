import React from 'react';
import { PipelineStage } from '../types';
import { Activity, Brain, Users, MessageSquare, Files, BarChart, CheckCircle, Video, PlayCircle } from 'lucide-react';

interface Props {
  currentStage: PipelineStage;
}

const stages = [
  { id: PipelineStage.FETCH, label: 'Fetch', icon: Activity },
  { id: PipelineStage.ANALYZE, label: 'Analyze', icon: Brain },
  { id: PipelineStage.CONSOLIDATE, label: 'Merge', icon: Users },
  { id: PipelineStage.DISCUSS, label: 'Discuss', icon: MessageSquare },
  { id: PipelineStage.CARDS, label: 'Cards', icon: Files },
  { id: PipelineStage.CHARTS, label: 'Charts', icon: BarChart },
  { id: PipelineStage.FOLLOW_UP, label: 'Check', icon: CheckCircle },
  { id: PipelineStage.VIDEO, label: 'Video', icon: Video },
  { id: PipelineStage.MARATHON, label: 'Action', icon: PlayCircle },
];

export const PipelineVisualizer: React.FC<Props> = ({ currentStage }) => {
  return (
    <div className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 backdrop-blur-sm">
      <div className="flex justify-between items-center relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -z-10 transform -translate-y-1/2" />
        
        {stages.map((stage) => {
          const isActive = currentStage === stage.id;
          const isPast = currentStage > stage.id;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col items-center gap-2 bg-slate-900 px-2 z-10">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110' : 
                    isPast ? 'bg-emerald-900/50 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-600 text-slate-500'}
                `}
              >
                <Icon size={18} className={isActive ? 'animate-pulse text-white' : ''} />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : isPast ? 'text-emerald-500' : 'text-slate-500'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
