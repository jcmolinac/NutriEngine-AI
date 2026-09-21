"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, Box, Sparkles } from "lucide-react";

interface DualAngleCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteCapture: (topAngleBase64: string, sideAngleBase64: string) => void;
}

export const DualAngleCaptureModal: React.FC<DualAngleCaptureModalProps> = ({
  isOpen,
  onClose,
  onCompleteCapture,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [topImage, setTopImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [, setCameraActive] = useState(false);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Cámara no disponible para toma de ángulo dual:", err);
      setCameraActive(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setStep(1);
    setTopImage(null);
    setSideImage(null);
    onClose();
  }, [onClose, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const captureFrame = (): string => {
    if (!videoRef.current) return "";
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.85);
    }
    return "";
  };

  const handleCapture = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(35);
    }
    const shot = captureFrame();
    if (step === 1) {
      setTopImage(shot);
      setStep(2);
    } else {
      setSideImage(shot);
      if (topImage && shot) {
        onCompleteCapture(topImage, shot);
        handleClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-white rounded-4xl border border-stone-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fitia-yellow text-fitia-dark flex items-center justify-center font-bold">
              <Box className="w-5 h-5 text-fitia-dark" />
            </div>
            <div>
              <h3 className="text-sm font-black text-fitia-dark">
                Doble Toma Estereoscópica 3D
              </h3>
              <span className="text-[10px] text-stone-500 font-medium">
                Paso {step} de 2: {step === 1 ? "Cenital 90° (Superficie)" : "Lateral 45° (Relieve y grosor)"}
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-dual-angle-modal"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Viewfinder */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border border-stone-800 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Guía en pantalla según el paso */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              {step === 1 ? (
                <div className="w-56 h-56 border-2 border-dashed border-fitia-yellow/90 rounded-full flex flex-col items-center justify-center text-center p-3">
                  <span className="text-xs text-white font-bold bg-black/60 px-2.5 py-1 rounded-full shadow-md">
                    Coloca la cámara justo arriba (90°)
                  </span>
                </div>
              ) : (
                <div className="w-60 h-36 border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xs text-white font-bold bg-black/60 px-2.5 py-1 rounded-full shadow-md">
                    Inclina la cámara a 45° para grosor
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instrucciones clínicas */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fitia-yellow shrink-0" />
            <p className="leading-snug">
              {step === 1
                ? "La toma cenital detecta ingredientes y área superficial."
                : "La toma lateral estima la altura y volumen en cm³ con precisión milimétrica."}
            </p>
          </div>

          {/* Botón de captura */}
          <button
            type="button"
            id="btn-capture-angle"
            onClick={handleCapture}
            className="w-full h-12 min-h-[44px] rounded-2xl bg-fitia-yellow text-fitia-dark text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
          >
            <Camera className="w-5 h-5 text-fitia-dark" />
            <span>{step === 1 ? "Capturar Vista Cenital (1/2)" : "Capturar Vista Lateral (2/2)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
