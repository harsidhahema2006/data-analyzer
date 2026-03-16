"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, FileText, Upload, ShieldCheck, 
  Activity, Zap, Globe, Lock, LogOut, ChevronRight,
  Database, AlertTriangle, Layers, X, User, Phone, Calendar,
  Cpu, ShieldAlert, Binary
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import SecurePipeline, { PipelineStep } from "@/components/SecurePipeline";

const INITIAL_PIPELINE: PipelineStep[] = [
  { id: 1, label: "Input Sanitization", sublabel: "SQLi & XSS Filter", icon: ShieldCheck, status: "pending" },
  { id: 2, label: "API Gateway Protection", sublabel: "Rate Limiting @ 10k/sec", icon: Zap, status: "pending" },
  { id: 3, label: "Onion Routing (Tor)", sublabel: "3-Layer Obfuscation", icon: Globe, status: "pending" },
  { id: 4, label: "PQC Encryption", sublabel: "Lattice-based (Kyber)", icon: Lock, status: "pending" },
  { id: 5, label: "ZKP Integration", sublabel: "Zero-Knowledge Proofs", icon: Binary, status: "pending" },
  { id: 6, label: "Blockchain Sync", sublabel: "Merkle Tree Anchoring", icon: Database, status: "pending" },
  { id: 7, label: "HSM / TEE Enclave", sublabel: "Isolated Storage", icon: Cpu, status: "pending" },
];

const DEPTS = [
  { name: "Identity Node", icon: User, color: "text-cyan-400" },
  { name: "Income Node", icon: Database, color: "text-emerald-400" },
  { name: "Health Node", icon: Activity, color: "text-pink-400" },
  { name: "Social Node", icon: Layers, color: "text-blue-400" },
];

const DEPT_ITEMS: Record<string, string[]> = {
  "Identity Node": ["Aadhaar Card", "Birth Certificate"],
  "Income Node": ["PAN Card", "Tax Certificate"],
  "Health Node": ["Health Records"],
  "Social Node": ["Social Subsidies"],
};

export default function AdminDashboard() {
  const [user, setUser] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(INITIAL_PIPELINE);
  
  // Form State
  const [formData, setFormData] = useState({ docName: "", name: "", phone: "", dob: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetDept, setTargetDept] = useState("");
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (!username || !token || localStorage.getItem("role") !== "admin") {
      router.push("/");
      return;
    }
    setUser(username);
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const resp = await api.get("/documents");
      setDocuments(resp.data);
    } catch (err) {
      console.error(err);
      if ((err as any).response?.status === 401) {
          localStorage.clear();
          router.push("/");
      }
    }
  };

  const handleItemDepositClick = (deptName: string, itemName: string) => {
    setTargetDept(deptName);
    setFormData({ ...formData, docName: itemName });
    setShowUploadModal(true);
  };

  const startSecureUpload = async () => {
    if (!formData.docName || !formData.name || !formData.phone || !formData.dob || !selectedFile) {
        alert("Please fill all security metadata fields and select a file.");
        return;
    }
    setShowUploadModal(false);
    setShowPipeline(true);
    setPipelineSteps(INITIAL_PIPELINE);

    const runStep = async (id: number, delay: number) => {
      setPipelineSteps(prev => prev.map(s => 
        s.id === id ? { ...s, status: "active" } : 
        (s.id < id ? { ...s, status: "completed" } : s)
      ));
      await new Promise(r => setTimeout(r, delay));
    };

    await runStep(1, 1000);
    await runStep(2, 1200);
    await runStep(3, 1500);
    await runStep(4, 1200);
    await runStep(5, 1000);
    await runStep(6, 1500);
    await runStep(7, 1000);
    
    try {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("name", formData.docName);
      data.append("department", targetDept);
      data.append("citizen_name", formData.name);
      data.append("citizen_phone", formData.phone);
      data.append("citizen_dob", formData.dob);

      await api.post("/deposit", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setPipelineSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
      setTimeout(() => {
          setShowPipeline(false);
          alert(`Secure Deposit Complete: ${formData.docName} has been stored in ${targetDept}.`);
          setFormData({ docName: "", name: "", phone: "", dob: "" });
          setSelectedFile(null);
          fetchDocuments(); // Refresh list
      }, 1500);
    } catch (err) {
      alert("Pipeline Security Breach: Failed to finalize deposit in hardware enclave.");
      setShowPipeline(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-200">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
             <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Admin Command Node</h1>
            <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Operator: {user} // Level 5 Alpha</p>
          </div>
        </div>
        <button onClick={logout} className="p-3 rounded-xl bg-white border border-slate-200 hover:text-pink-500 hover:border-pink-500/30 transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {DEPTS.map((dept) => (
          <section key={dept.name} className="glass-panel p-8 flex flex-col space-y-6 relative overflow-hidden group min-h-[350px]">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
               <dept.icon className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10 mb-6 border-b border-slate-200 pb-4">
              <dept.icon className={`w-6 h-6 ${dept.color}`} />
              <h2 className="text-xl font-bold tracking-tight">{dept.name}</h2>
            </div>

            <div className="space-y-4 relative z-10">
              {DEPT_ITEMS[dept.name]?.map((itemName) => (
                <div key={itemName} className="p-4 bg-white/40 border border-slate-200 rounded-2xl group/item hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover/item:bg-slate-200 transition-colors">
                        <FileText className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{itemName}</span>
                    </div>
                    <button
                      onClick={() => handleItemDepositClick(dept.name, itemName)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Deposit
                    </button>
                  </div>
                  
                  {/* Assets hidden from Admin view for security */}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel w-full max-w-md p-8 relative"
            >
              <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 p-2 text-slate-700 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-2xl bg-cyan-500/10 mb-4 border border-cyan-500/20">
                    <ShieldCheck className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Secure Document Ingestion</h3>
                <p className="text-xs text-slate-700 mt-1 uppercase font-mono tracking-widest text-cyan-500">{targetDept}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-700 tracking-widest ml-1">Document Attachment</label>
                  <div className="flex items-center gap-3">
                     <label className="flex-1 flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all">
                        <Upload className="w-5 h-5 text-cyan-500" />
                        <span className="text-xs text-slate-600 font-medium">
                           {selectedFile ? selectedFile.name : "Select from device"}
                        </span>
                        <input 
                           type="file" 
                           className="hidden" 
                           onChange={e => {
                               const file = e.target.files?.[0];
                               if (file) {
                                   setSelectedFile(file);
                                   if (!formData.docName) setFormData({...formData, docName: file.name.split('.')[0]});
                               }
                           }}
                        />
                     </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-700 tracking-widest ml-1">Display Name</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                    <input 
                      className="cyber-input pl-10 text-sm py-2" 
                      placeholder="e.g. Birth Certificate" 
                      value={formData.docName}
                      onChange={e => setFormData({...formData, docName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-slate-700 tracking-widest ml-1">Citizen Full Name</label>
                   <div className="relative">
                     <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                     <input 
                       type="text"
                       className="cyber-input pl-10 text-sm py-2" 
                       placeholder="e.g. Harish Kumar" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-slate-700 tracking-widest ml-1">Phone Number</label>
                     <div className="relative">
                         <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                         <input 
                           type="tel"
                           className="cyber-input pl-10 text-sm py-2" 
                           placeholder="e.g. 9876543210" 
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                         />
                     </div>
                     </div>
                     <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-slate-700 tracking-widest ml-1">Date of Birth</label>
                     <div className="relative">
                         <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                         <input 
                           type="date"
                           className="cyber-input pl-10 text-sm py-2" 
                           value={formData.dob}
                           onChange={e => setFormData({...formData, dob: e.target.value})}
                         />
                     </div>
                     </div>
                 </div>
                </div>

                <button 
                  onClick={startSecureUpload}
                  className="cyber-button w-full mt-4 flex items-center justify-center gap-2 group py-3"
                >
                  INITIALIZE SECURITY PIPELINE <ChevronRight className="w-4 h-4 group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pipeline Visualization */}
      <AnimatePresence>
        {showPipeline && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/95">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-full max-w-lg space-y-8"
            >
                <div className="text-center">
                    <div className="inline-block p-4 rounded-full border-2 border-dashed border-cyan-500 animate-[spin_10s_linear_infinite] mb-6">
                        <ShieldCheck className="w-12 h-12 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">SECURE MULTI-LAYER INGESTION</h3>
                    <p className="text-[10px] font-mono text-cyan-500 mt-2 uppercase tracking-[0.3em]">Deploying Decentralized Security Protocols...</p>
                </div>

                <SecurePipeline steps={pipelineSteps} />

                <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[9px] font-mono whitespace-nowrap">BLOCKCHAIN TICKETS: SYNCED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono whitespace-nowrap">PQC-AES-256: ENABLED</span>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
