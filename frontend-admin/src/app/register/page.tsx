"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Lock, Calendar, ClipboardCheck, ArrowRight, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useEffect } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    name: "", dob: "", age: "", gender: "", phone: "", username: "", password: "", confirmPassword: ""
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && ! (window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          console.log("Recaptcha verified");
        }
      });
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Backend Pre-registration
      await api.post("/register", formData);
      
      // 2. Bypass Firebase Phone Auth for demo and proceed to Step 2
      setStep(2);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || "Registration failed. Check phone number format.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      // 3. Confirm OTP with Backend
      const cleanOtp = otp.trim();
      await api.post(`/verify-otp?username=${formData.username}&otp=${cleanOtp}`);
      
      alert("Identity Verified via Backend! Redirecting to login...");
      router.push("/login");
    } catch (err: any) {
      alert("Invalid OTP or Verification Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="glass-panel w-full max-w-2xl p-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-pink-500/20 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Identity Registration</h1>
                <p className="text-slate-700 text-sm">Create your secure decentralized governance ID</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                  <input
                    type="text" placeholder="Full Name"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                  <input
                    type="date" placeholder="Date of Birth"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input
                    type="number" placeholder="Age"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required
                  />
                  <select
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} required
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                  <input
                    type="tel" placeholder="Phone Number"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <ClipboardCheck className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                  <input
                    type="text" placeholder="Username"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                  <input
                    type="password" placeholder="Password"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-700" />
                  <input
                    type="password" placeholder="Confirm Password"
                    className="w-full bg-white/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required
                  />
                </div>
                <div className="pt-2">
                  <button
                    disabled={loading}
                    className="w-full cyber-button border-pink-500 text-pink-400 hover:bg-pink-500 flex items-center justify-center gap-2 group py-3"
                  >
                    {loading ? "INITIALIZING..." : "GENERATE IDENTITY ACCOUNT"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </form>
            <div id="recaptcha-container"></div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel w-full max-w-md p-10 text-center"
          >
            <div className="inline-block p-4 bg-cyan-500/10 rounded-full mb-6">
              <Phone className="w-12 h-12 text-cyan-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold mb-2">MFA Verification</h2>
            <p className="text-slate-700 text-sm mb-8">
              We've sent a 6-digit cryptographic OTP to your registered phone ending in ****{formData.phone.slice(-4)}.
            </p>
            
            <div className="space-y-6">
              <input
                type="text" maxLength={6} placeholder="· · · · · ·"
                className="w-full bg-white/50 border-2 border-slate-200 rounded-xl py-4 text-center text-3xl font-mono tracking-[0.5em] focus:border-cyan-500 outline-none"
                value={otp} onChange={(e) => setOtp(e.target.value)}
              />
              
              <button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full cyber-button py-4 text-lg"
              >
                {loading ? "AUTHENTICATING..." : "VERIFY & FINALIZE"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
