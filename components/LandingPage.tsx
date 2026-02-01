
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

            <div className="max-w-5xl mx-auto relative z-10 text-center">
               <div className="inline-flex items-center gap-2 bg-slate-800/50 rounded-full px-3 py-1 mb-6 border border-slate-700 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-300 tracking-wider">SYSTEM ONLINE · 9 AGENTS ACTIVE · MARATHON MODE READY</span>
               </div>

               <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
                  The Operating System for <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">
                     Autonomous City Intelligence
                  </span>
               </h1>

               <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                  We've built the first <strong>multi-model autonomous core</strong> that doesn't just display city data—it understands it. Nine specialized agents synthesized by Gemini 2.5 Pro to predict urban dynamics, resolve cross-domain conflicts, and persistent tracking in a 24/7 autonomous loop.
               </p>

               <button
                  onClick={onEnter}
                  className="group inline-flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
               >
                  Initialize Platform
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>

         {/* 2. Architecture & Pipeline */}
         <div className="max-w-7xl mx-auto px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">

               <div>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                     <Database className="text-emerald-500" />
                     9-Agent Distributed Core
                  </h2>
                  <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                     We replaced siloed dashboards with a distributed mesh of specialized agents covering San Francisco's three critical operational domains.
                  </p>

                  <div className="space-y-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-pink-50 text-pink-600 rounded-xl"><Shield size={28} /></div>
                        <div>
                           <h3 className="font-bold text-xl text-slate-800">Public Safety (PS)</h3>
                           <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                              <strong>Agents 1-3:</strong> Real-time synthesis of SODA Police/Fire data, NBC localized news scraping, and Legistar safety committee feeds.
                           </p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Hammer size={28} /></div>
                        <div>
                           <h3 className="font-bold text-xl text-slate-800">Infrastructure (IU)</h3>
                           <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                              <strong>Agents 4-6:</strong> Cross-referencing 311 case velocity, SFPUC utility news, and Street Use Permits to predict congestion.
                           </p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Map size={28} /></div>
                        <div>
                           <h3 className="font-bold text-xl text-slate-800">Land Use (LZ)</h3>
                           <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                              <strong>Agents 7-9:</strong> Tracking building permit flows, Planning Dept agendas, and neighborhood zoning changes.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                     <Activity className="text-blue-500" />
                     Autonomous Pipeline
                  </h2>
                  <div className="relative pl-8 border-l-2 border-slate-200 space-y-10">
                     {[
                        { title: "Parallel Multi-Source Fetch", desc: "Agents concurrently query SODA APIs, scrape news sites, and parse government docs." },
                        { title: "Cross-Area Roundtable", desc: "Gemini Pro Orchestrator facilitates debate between domain consolidators to flag cross-sector conflicts." },
                        { title: "Marathon Loop (Continuous)", desc: "Perpetual autonomous cycles ensure 24/7 vigilance, with continuous validation and cache updates." },
                        { title: "Stage 7 Persistence", desc: "A dedicated memory layer tracks issues over time, comparing fresh data to history to flag worsening trends." },
                     ].map((step, i) => (
                        <div key={i} className="relative group">
                           <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-500 group-hover:scale-125 transition-transform" />
                           <h3 className="font-bold text-lg text-slate-800">{step.title}</h3>
                           <p className="text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>

         {/* 3. Tech Stack & Vision */}
         <div className="bg-slate-900 text-slate-300 py-24 px-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Powered by State-of-the-Art Generative AI</h2>
               <p className="text-slate-400 max-w-2xl mx-auto">
                  We leverage Google's most advanced models to deliver not just text, but visual intelligence.
               </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                  <div className="text-emerald-400 font-bold text-xl mb-4 flex items-center gap-2">
                     <Infinity size={24} /> Gemini 2.5 Pro
                  </div>
                  <p className="text-sm leading-relaxed">
                     Powers the <strong>Marathon Orchestrator</strong>. It handles complex reasoning, cross-domain synthesis, and manages the autonomous agent loop with high-fidelity context retention.
                  </p>
               </div>

               <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                  <div className="text-pink-400 font-bold text-xl mb-4 flex items-center gap-2">
                     <Video size={24} /> Veo 3.1
                  </div>
                  <p className="text-sm leading-relaxed">
                     Generates cinematic <strong>Video Reports</strong>. Takes issue cards and creates 30s executive briefs with photorealistic urban footage, driven by data narratives.
                  </p>
               </div>

               <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                  <div className="text-blue-400 font-bold text-xl mb-4 flex items-center gap-2">
                     <Map size={24} /> Imagen 4
                  </div>
                  <p className="text-sm leading-relaxed">
                     Creates <strong>Visual Storyboards</strong>. Generates high-fidelity static frames to visualize potential future states of urban infrastructure before video synthesis.
                  </p>
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="py-8 text-center text-slate-600 text-sm bg-slate-950 border-t border-slate-900 font-mono">
            Lighthouse SF · Autonomous City Intelligence Platform · Ver 1.2
         </div>

      </div>
   );
};
