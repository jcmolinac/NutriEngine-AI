"use client";

import React, { useState } from "react";
import { Copy, Check, Download, X, Code, ShieldCheck, RotateCcw } from "lucide-react";
import { NutriEngineOutput } from "@/types/nutrition";

interface JsonInspectorProps {
  data: NutriEngineOutput;
  isOpen: boolean;
  onClose: () => void;
  onResetData?: () => void;
}

export const JsonInspector: React.FC<JsonInspectorProps> = ({ data, isOpen, onClose, onResetData }) => {
  const [copied, setCopied] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentTranslateY, setCurrentTranslateY] = useState<number>(0);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(40);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutriengine-${data.accion_ejecutada.toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) {
      setCurrentTranslateY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (currentTranslateY > 100) {
      onClose();
    }
    setCurrentTranslateY(0);
    setStartY(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal (Mobile-Only) */}
      <div
        style={{
          transform: `translateY(${currentTranslateY}px)`,
          transition: startY ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="relative w-full max-w-md mx-auto bg-stone-900 text-stone-100 rounded-t-[32px] shadow-2xl flex flex-col max-h-[90dvh] pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-stone-800 animate-in slide-in-from-bottom duration-300"
      >
        {/* Swipe Handle */}
        <div
          className="w-full pt-3.5 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-14 h-1.5 rounded-full bg-stone-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Inspector JSON</h3>
              <p className="text-[11px] text-stone-400">
                Acción: <span className="text-emerald-400 font-mono font-semibold">{data.accion_ejecutada}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-json-inspector"
            type="button"
            onClick={onClose}
            aria-label="Cerrar inspector JSON"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schema Status pill */}
        <div className="px-5 py-2 bg-emerald-950/40 border-b border-emerald-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold text-[11px]">Contrato NutriEngine OK</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            {Object.keys(data).length} nodos raíz
          </span>
        </div>

        {/* Scrollable JSON Content */}
        <div className="flex-1 overflow-y-auto overscroll-y-none p-4 font-mono text-xs leading-relaxed text-stone-300 selection:bg-emerald-800 selection:text-white mobile-scroll">
          <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
        </div>

        {/* Touch Ergonomic Bottom Actions (min 44px) */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-copy-json"
              type="button"
              onClick={handleCopy}
              className="h-12 min-h-[44px] rounded-xl bg-stone-800 active:bg-stone-700 hover:bg-stone-750 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-stone-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
              <span>{copied ? "¡Copiado!" : "Copiar JSON"}</span>
            </button>

            <button
              id="btn-download-json"
              type="button"
              onClick={handleDownload}
              className="h-12 min-h-[44px] rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .json</span>
            </button>
          </div>

          {onResetData && (
            <button
              id="btn-reset-pwa-data"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate?.(30);
                }
                onResetData();
                onClose();
              }}
              className="w-full h-11 min-h-[44px] rounded-xl bg-rose-950/40 hover:bg-rose-900/50 active:bg-rose-900/70 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-800/50 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer datos de la aplicación a valores iniciales</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
