"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

export interface Stage {
  id: number;
  label: string;
  status: "pending" | "active" | "completed";
}

interface ProcessRoadmapProps {
  stages: Stage[];
}

export default function ProcessRoadmap({ stages }: ProcessRoadmapProps) {
  return (
    <section className="glass-panel p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">
          Retrieval Protocol Roadmap
        </h3>
        <span className="text-[10px] text-cyan-400 font-mono italic">SECURE PIPELINE</span>
      </div>

      <div className="relative space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

        {stages.map((stage, index) => (
          <div key={stage.id} className="relative flex items-center gap-4 group">
            <div className="relative z-10">
              {stage.status === "completed" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500 rounded-full p-0.5 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-900" />
                </motion.div>
              ) : stage.status === "active" ? (
                <div className="w-6 h-6 rounded-full border-2 border-cyan-500 bg-slate-50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-slate-50" />
              )}
            </div>

            <div className="flex flex-col">
              <span 
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  stage.status === "completed" 
                    ? "text-emerald-400" 
                    : stage.status === "active" 
                      ? "text-cyan-400" 
                      : "text-slate-600"
                }`}
              >
                {stage.label}
              </span>
              <span className="text-[9px] font-mono text-slate-700 mt-1 uppercase">
                {stage.status === "completed" 
                  ? "Verified & Logged" 
                  : stage.status === "active" 
                    ? "Processing..." 
                    : "Awaiting Trigger"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
