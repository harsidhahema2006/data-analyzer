"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, User, ChevronRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const resp = await fetch("http://127.0.0.1:9005/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", "admin");
        router.push("/dashboard");
      } else {
        setError("Invalid administrative credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("Connection to Security Node failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          >
            <Shield className="w-12 h-12 text-cyan-400" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">ADMIN COMMAND</h2>
          <p className="text-xs text-slate-700 uppercase tracking-[0.3em] mt-2 font-mono">Secure Node Entry Required</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-600 font-bold ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                <input 
                  type="text" 
                  className="cyber-input pl-10" 
                  placeholder="Admin identifier"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-600 font-bold ml-1">Master Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                <input 
                  type="password" 
                  className="cyber-input pl-10" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 text-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="cyber-button w-full flex items-center justify-center gap-2 group py-3"
            >
              {loading ? "AUTHENTICATING..." : "ENTRY COMMAND"} 
              {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> }
            </button>
          </form>
        </motion.div>

        <div className="text-center">
            <p className="text-[9px] text-slate-700 uppercase tracking-widest font-mono">
              Authorized access only. All actions are logged and encrypted.
            </p>
        </div>
      </div>
    </div>
  );
}
