"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Lock, User, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useEffect } from "react";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1: Login, 2: MFA
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && ! (window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const response = await api.post(`/login`, params);
      const userPhone = response.data.phone;
      
      setPhoneNumber(userPhone);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Invalid credentials or OTP initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      // 1. Confirm OTP directly with backend
      const cleanOtp = otp.trim();
      const resp = await api.post(`/token?username=${username}&otp=${cleanOtp}`);
      
      localStorage.setItem("token", resp.data.access_token);
      localStorage.setItem("username", username);
      router.push("/dashboard");
    } catch (err: any) {
      alert("Invalid MFA token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel w-full max-w-md p-10"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <LogIn className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Secure Login</h1>
                <p className="text-slate-700 text-sm">Synchronize with national nodes</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-700" />
                <input
                  type="text" placeholder="Identity Username"
                  className="w-full bg-white/50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  value={username} onChange={(e) => setUsername(e.target.value)} required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-700" />
                <input
                  type="password" placeholder="Key Access Password"
                  className="w-full bg-white/50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
              </div>

              <button
                disabled={loading}
                className="w-full cyber-button py-4 text-lg font-bold flex items-center justify-center gap-2 group"
              >
                {loading ? "LINKING NODES..." : "INITIATE ACCESS"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
              </button>
            </form>
            <div id="recaptcha-container"></div>
          </motion.div>
        ) : (
          <motion.div
            key="mfa"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-10 text-center"
          >
            <div className="inline-block p-4 bg-cyan-500/10 rounded-full mb-6">
              <ShieldCheck className="w-12 h-12 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Second Factor Required</h2>
            <p className="text-slate-700 text-sm mb-8">
              Verify your identity via the cryptographic OTP sent to your device.
            </p>
            
            <div className="space-y-6">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-700" />
                <input
                  type="text" maxLength={6} placeholder="6-Digit OTP"
                  className="w-full bg-white/50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-center font-mono text-xl tracking-widest focus:ring-2 focus:ring-cyan-500 outline-none"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleMfa}
                disabled={loading || otp.length !== 6}
                className="w-full cyber-button py-4"
              >
                {loading ? "DECRYPTING VAULT..." : "COMPLETE AUTHENTICATION"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
