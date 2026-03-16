"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThreatHeatmap() {
  const [points, setPoints] = useState<{ x: number, y: number, intensity: number }[]>([]);

  useEffect(() => {
    const generatePoints = () => {
      const newPoints = Array.from({ length: 15 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random()
      }));
      setPoints(newPoints);
    };

    generatePoints();
    const interval = setInterval(generatePoints, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden group">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-1">Live Threat Intel</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <span className="text-pink-500 text-lg font-bold">DETECTION ACTIVE</span>
        </div>
      </div>

      <div className="absolute inset-0 opacity-20 cyber-grid" />
      
      {/* Blurred "Heat" Points */}
      {points.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: p.intensity * 0.5, scale: 1 + p.intensity }}
          className="absolute w-12 h-12 rounded-full bg-pink-500 blur-xl"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          transition={{ duration: 2 }}
        />
      ))}

      {/* Target Crosshair */}
      <motion.div 
        animate={{ 
          top: ["10%", "80%", "30%", "60%"],
          left: ["10%", "20%", "70%", "40%"]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-8 h-8 pointer-events-none z-20"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
      </motion.div>

      <div className="absolute bottom-4 right-4 text-[8px] font-mono text-slate-600 uppercase">
        Scanning: Global Infrastructure Nodes...
      </div>
    </div>
  );
}
