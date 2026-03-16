"use client";

import { motion } from "framer-motion";
import { Server, Database, Shield, Globe, Cpu } from "lucide-react";

const nodes = [
  { id: "client", label: "Identity", icon: Globe, x: 0, y: 50, color: "text-cyan-400" },
  { id: "gateway", label: "API Gateway", icon: Shield, x: 25, y: 50, color: "text-emerald-400" },
  { id: "lb", label: "Load Balancer", icon: Cpu, x: 50, y: 50, color: "text-pink-400" },
  { id: "backend", label: "Governance Node", icon: Server, x: 75, y: 50, color: "text-cyan-400" },
  { id: "db", label: "Encrypted Vault", icon: Database, x: 100, y: 50, color: "text-emerald-400" },
];

export default function FlowDiagram() {
  return (
    <div className="relative w-full h-48 bg-slate-50/50 rounded-2xl border border-slate-200 p-8 overflow-hidden">
      <div className="absolute inset-0 opacity-10 cyber-grid" />
      
      {/* Animated Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 50 96 H 900"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative flex justify-between items-center h-full z-10">
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <div className={`p-4 rounded-xl bg-white border border-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${node.color} relative group`}>
              <node.icon className="w-8 h-8" />
              <div className={`absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-10 blur-md transition-opacity`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">{node.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
