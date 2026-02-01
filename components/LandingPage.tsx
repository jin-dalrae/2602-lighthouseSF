
import React from 'react';
import { C } from '../constants';
import { 
  Shield, Hammer, Map, Database, Newspaper, Building2, 
  Activity, Play, ArrowRight, Video, Infinity, Radio 
} from 'lucide-react';

interface Props {
  onEnter: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnter }) => {
  return (
    <div style={{ background: C.paper, color: C.navy, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-24 px-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full">
             <defs>
               <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                 <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
               </pattern>
             </defs>
             <rect width="100" height="100" fill="url(#grid)" />
           </svg>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 rounded-full px-3 py-1 mb-6 border border-slate-700">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-xs font-mono text-emerald-300">SYSTEM ONLINE · 9 AGENTS ACTIVE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Lighthouse SF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              City Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            A 9-agent autonomous urban analytics core. Synthesizing Public Safety, Infrastructure, and Zoning signals to predict city dynamics before they happen.
          </p>
          
          <button 
            onClick={onEnter}
            className="group flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
          >
            Initialize Platform
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 2. Architecture & Pipeline */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
           
           <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                 <Radio className="text-emerald-500" />
                 Architecture
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                 A distributed mesh of specialized agents covers three critical domains of San Francisco's operations.
              </p>
              
              <div className="space-y-4">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-pink-100 text-pink-600 rounded-lg"><Shield size={24} /></div>
                    <div>
                       <h3 className="font-bold text-lg">Public Safety (PS)</h3>
                       <p className="text-slate-500 text-sm mt-1">SODA (Police/Fire) + NBC Bay Area + Legistar (Safety Comm)</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Hammer size={24} /></div>
                    <div>
                       <h3 className="font-bold text-lg">Infrastructure (IU)</h3>
                       <p className="text-slate-500 text-sm mt-1">SODA (311/Streets) + SFPUC News + Budget Comm</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><Map size={24} /></div>
                    <div>
                       <h3 className="font-bold text-lg">Land Use (LZ)</h3>
                       <p className="text-slate-500 text-sm mt-1">SODA (Permits) + Planning News + Land Use Comm</p>
                    </div>
                 </div>
              </div>
           </div>

           <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                 <Activity className="text-blue-500" />
                 9-Stage Pipeline
              </h2>
              <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
                 {[
                    { title: "Parallel Fetch", desc: "9 Agents sync query SODA & scrape Gov/News sources (≤2min)" },
                    { title: "Cross-Area Roundtable", desc: "Consolidators discuss conflicts (e.g. Construction blocking EMS)" },
                    { title: "Issue Card Generation", desc: "Orchestrator synthesizes debate into ranked actionable cards" },
                    { title: "Marathon Action Queue", desc: "Continuous loop checking past issues against fresh data" },
                 ].map((step, i) => (
                    <div key={i} className="relative">
                       <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-blue-500" />
                       <h3 className="font-bold text-lg text-slate-800">{step.title}</h3>
                       <p className="text-slate-500">{step.desc}</p>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>

      {/* 3. Marathon Agents & Video Section */}
      <div className="bg-slate-900 text-slate-300 py-20 px-8 border-t border-slate-800">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Autonomous Operations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Marathon Orchestrator Card */}
               <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-slate-700 rounded-lg text-emerald-400"><Infinity size={28} /></div>
                     <h3 className="text-2xl font-bold text-white">Marathon Orchestrator</h3>
                  </div>
                  <div className="font-mono text-xs bg-black/50 p-4 rounded-lg text-emerald-300/90 leading-relaxed mb-6">
                     <div className="mb-2 text-slate-500">// LOGIC LOOP</div>
                     <div>Previous cycle issues: &#123;list&#125;</div>
                     <div>Fresh data pull: &#123;new signals&#125;</div>
                     <br/>
                     <div className="text-purple-400">For each past issue:</div>
                     <div>- Status: improving | stagnant | worsening</div>
                     <div>- If worsening → escalate & flag</div>
                     <br/>
                     <div className="text-blue-400">JSON Output:</div>
                     <div>&#123;</div>
                     <div className="pl-4">"followed_up": [...],</div>
                     <div className="pl-4">"new_suggestions": [&#123;"agent": "PS Data", "priority": 8/10&#125;]</div>
                     <div>&#125;</div>
                  </div>
                  <p className="text-slate-400">
                     Ensures no signal is lost. The system tracks issue resolution over time, automatically flagging stagnant problems or escalating worsening trends without human intervention.
                  </p>
               </div>

               {/* Video Agent Card */}
               <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-pink-500/50 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-slate-700 rounded-lg text-pink-400"><Video size={28} /></div>
                     <h3 className="text-2xl font-bold text-white">Video Agent Planner</h3>
                  </div>
                  <div className="font-mono text-xs bg-black/50 p-4 rounded-lg text-pink-300/90 leading-relaxed mb-6">
                     <div className="mb-2 text-slate-500">// VEO 3.1 SYNTHESIS</div>
                     <div>Top issue: &#123;issue card JSON&#125;</div>
                     <br/>
                     <div className="text-purple-400">Create 30s video plan:</div>
                     <div>1. Storyboard: 4–5 scenes with description</div>
                     <div>2. Suggest Imagen prompts for static frames</div>
                     <div>3. Veo chain plan: image1 → 8s clip → extend 3×</div>
                     <br/>
                     <div className="text-blue-400">JSON Output:</div>
                     <div>&#123;</div>
                     <div className="pl-4">"veo_chain_steps": ["clip1", "extend..."],</div>
                     <div className="pl-4">"total_duration_sec": 30</div>
                     <div>&#125;</div>
                  </div>
                  <p className="text-slate-400">
                     Converts complex data reports into cinematic executive briefs. Uses Imagen for storyboarding and Veo 3.1 for generating photorealistic video narratives of critical city issues.
                  </p>
               </div>

            </div>
         </div>
      </div>
      
      {/* Footer */}
      <div className="py-8 text-center text-slate-500 text-sm bg-slate-900 border-t border-slate-800">
         San Francisco City Intelligence · Built on Google Gemini 2.5 Pro & Flash · Veo 3.1 · Imagen 4
      </div>

    </div>
  );
};
