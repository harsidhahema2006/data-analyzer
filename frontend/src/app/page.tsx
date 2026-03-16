"use client";

import { motion } from "framer-motion";
import { Shield, UserPlus, LogIn, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Animated Welcome Screen */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block p-4 rounded-full border-2 border-dashed border-[var(--primary)] mb-6"
        >
          <Shield className="w-16 h-16 text-[var(--primary)]" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-4 tracking-tighter">
          VIGILANT
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide italic">
          Welcome to the Secure E-Governance Portal. Secure. Integrated. Future-Ready.
        </p>
      </motion.div>

      {/* Options Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Existing User */}
        <motion.div
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel p-8 flex flex-col items-center text-center cursor-pointer group"
        >
          <Link href="/login" className="flex flex-col items-center w-full">
            <div className="p-4 rounded-xl bg-cyan-500/10 mb-4 transition-colors group-hover:bg-cyan-500/20">
              <LogIn className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Existing User</h2>
            <p className="text-slate-700 text-sm mb-6">Access your digital vault and government services via secure MFA.</p>
            <div className="cyber-button flex items-center gap-2">
              Sign In <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

        {/* New User */}
        <motion.div
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel p-8 flex flex-col items-center text-center cursor-pointer group border-pink-500/20"
        >
          <Link href="/register" className="flex flex-col items-center w-full">
            <div className="p-4 rounded-xl bg-pink-500/10 mb-4 transition-colors group-hover:bg-pink-500/20">
              <UserPlus className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">New User</h2>
            <p className="text-slate-700 text-sm mb-6">Register identity for a decentralized governance account.</p>
            <div className="cyber-button border-pink-500 text-pink-400 hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center gap-2">
              Create ID <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* System Footer Status */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 flex items-center gap-6 text-[10px] uppercase tracking-widest text-slate-600"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Nodes: Operational
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          PQC Layer: Active
        </div>
      </motion.div>
    </div>
  );
}
