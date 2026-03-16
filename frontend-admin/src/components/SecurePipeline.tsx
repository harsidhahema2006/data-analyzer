"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Globe, Zap, Database, Lock, 
  Cpu, Layers, CheckCircle2, ChevronDown 
} from "lucide-react";

export interface PipelineStep {
  id: number;
  label: string;
  sublabel: string;
  icon: any;
  status: "pending" | "active" | "completed";
}

interface SecurePipelineProps {
  steps: PipelineStep[];
}

export default function SecurePipeline({ steps }: SecurePipelineProps) {
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative p-4 rounded-2xl border transition-all ${
            step.status === "completed" 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : step.status === "active" 
                ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                : "bg-white/50 border-slate-200 opacity-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              step.status === "completed" ? "bg-emerald-500/20" : 
              step.status === "active" ? "bg-cyan-500/20" : "bg-slate-100"
            }`}>
              <step.icon className={`w-5 h-5 ${
                step.status === "completed" ? "text-emerald-400" : 
                step.status === "active" ? "text-cyan-400" : "text-slate-600"
              }`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-widest ${
                  step.status === "completed" ? "text-emerald-400" : 
                  step.status === "active" ? "text-cyan-400" : "text-slate-700"
                }`}>
                  {step.label}
                </h4>
                {step.status === "completed" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-700 mt-1 font-mono uppercase">
                {step.status === "active" ? "Processing..." : step.sublabel}
              </p>
            </div>
          </div>
          
          {step.status === "active" && (
            <motion.div 
              layoutId="line"
              className="absolute bottom-0 left-0 h-0.5 bg-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
