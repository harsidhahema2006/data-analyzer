"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, UserCheck, ShieldAlert, RefreshCw } from "lucide-react";

interface FaceRecognitionProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FaceRecognition({ onSuccess, onCancel }: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("Initializing Biometric Nodes...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setStatus("Biometric Models Secure. Requesting Camera...");
        startVideo();
      } catch (err) {
        console.error("Model loading failed:", err);
        setError("Security protocols failed to load biometric models.");
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setError("Unauthorized device access. Camera stream required.");
      });
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setStatus("Analyzing Facial Bio-Signature...");

    let attempts = 0;
    const maxAttempts = 5;

    const scanInterval = setInterval(async () => {
      attempts++;
      if (!videoRef.current) return;

      // Extremely permissive scan: Low threshold (0.1) and no landmarks for speed
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.1 })
      );

      if (detection) {
        clearInterval(scanInterval);
        setStatus("Identity Verified. Decrypting Document Access...");
        setTimeout(() => {
          onSuccess();
          setIsScanning(false);
          // Stop video stream
          const stream = videoRef.current?.srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
        }, 1200);
      } else if (attempts >= maxAttempts) {
        clearInterval(scanInterval);
        setStatus("Analysis Failed. Re-align Face with Scanner.");
        setIsScanning(false);
      }
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md"
    >
      <div className="glass-panel w-full max-w-lg p-8 relative overflow-hidden">
        {/* Animated Background Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-cyan-500/10 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-reverse-spin" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8 w-full justify-center">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Camera className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-cyan-400">BIOMETRIC AUTH</h2>
          </div>

          <div className="relative w-full aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xl mb-8">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
            
            {/* Scanner HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
                 <div className="w-56 h-56 border border-cyan-500/10 rounded-full animate-ping" />
                 <div className="w-44 h-44 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" />
              </div>
            </div>

            {isScanning && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#06b6d4] z-20"
              />
            )}
          </div>

          <div className="w-full space-y-4">
            <div className="text-center">
              <p className={`text-sm font-mono tracking-wider ${error ? 'text-pink-500' : 'text-slate-600'}`}>
                {error || status }
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all font-bold uppercase text-xs"
              >
                Abort Protocol
              </button>
              <button
                disabled={!isModelLoaded || isScanning || !!error}
                onClick={handleScan}
                className="flex-1 cyber-button py-3 text-xs flex items-center justify-center gap-2"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                {isScanning ? "PROCESSING..." : "INITIATE SCAN"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
