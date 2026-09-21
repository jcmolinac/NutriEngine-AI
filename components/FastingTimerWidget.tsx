"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame, Sparkles, Check, Moon, Sun } from "lucide-react";

interface FastingTimerWidgetProps {
  protocolo?: "16:8" | "14:10" | "18:6";
  onProtocolChange?: (protocol: "16:8" | "14:10" | "18:6") => void;
}

export const FastingTimerWidget: React.FC<FastingTimerWidgetProps> = ({
  protocolo = "16:8",
  onProtocolChange,
}) => {
  const [currentProtocol, setCurrentProtocol] = useState<"16:8" | "14:10" | "18:6">(protocolo);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalFastingHours = currentProtocol === "16:8" ? 16 : currentProtocol === "18:6" ? 18 : 14;
  const eatingWindowHours = 24 - totalFastingHours;

  // Por defecto en protocolo 16:8, la ventana de ingesta es 12:00 PM a 20:00 PM
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;

  const startEatingHour = 24 - eatingWindowHours - 4; // Ej. 12:00
  const endEatingHour = startEatingHour + eatingWindowHours; // Ej. 20:00

  const isEatingWindow = currentHour >= startEatingHour && currentHour < endEatingHour;

  // Cálculo de tiempo transcurrido y restante
  let elapsedSeconds = 0;
  let remainingSeconds = 0;

  if (isEatingWindow) {
    const windowTotalSec = eatingWindowHours * 3600;
    elapsedSeconds = Math.round((currentHour - startEatingHour) * 3600);
    remainingSeconds = Math.max(0, windowTotalSec - elapsedSeconds);
  } else {
    const fastingTotalSec = totalFastingHours * 3600;
    if (currentHour >= endEatingHour) {
      elapsedSeconds = Math.round((currentHour - endEatingHour) * 3600);
    } else {
      elapsedSeconds = Math.round((24 - endEatingHour + currentHour) * 3600);
    }
    remainingSeconds = Math.max(0, fastingTotalSec - elapsedSeconds);
  }

  const formatCountdown = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const totalCycleSec = (isEatingWindow ? eatingWindowHours : totalFastingHours) * 3600;
  const progressPct = Math.min(100, Math.max(0, Math.round((elapsedSeconds / totalCycleSec) * 100)));

  const handleSelectProtocol = (p: "16:8" | "14:10" | "18:6") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setCurrentProtocol(p);
    onProtocolChange?.(p);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-3">
      {/* Header con switch de protocolo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
              Crononutrición
            </span>
            <h4 className="text-sm font-black text-fitia-dark">
              Temporizador de Ayuno
            </h4>
          </div>
        </div>

        {/* Protocol Selector Chips */}
        <div className="flex gap-1 bg-stone-100 p-0.5 rounded-xl">
          {(["14:10", "16:8", "18:6"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSelectProtocol(p)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                currentProtocol === p
                  ? "bg-white text-fitia-dark shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Reloj de estado interactivo */}
      <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {isEatingWindow ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  Ventana de Ingesta Abierta
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-wider">
                  Ayuno Celular Activo
                </span>
              </>
            )}
          </div>
          <p className="text-xl font-black text-fitia-dark font-mono tracking-tight">
            {formatCountdown(remainingSeconds)}
          </p>
          <p className="text-[10px] text-stone-500 font-medium">
            {isEatingWindow
              ? `Cierra a las ${endEatingHour}:00 (${Math.round(eatingWindowHours)}h de comida)`
              : `Ventana abre a las ${startEatingHour}:00 (${totalFastingHours}h de ayuno)`}
          </p>
        </div>

        {/* Mini gauge circular */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-stone-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={isEatingWindow ? "text-amber-500" : "text-indigo-600"}
              strokeDasharray={`${progressPct}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-black font-mono text-fitia-dark">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Hitos biológicos del ayuno */}
      <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
        <div className="p-1.5 rounded-xl bg-stone-50 border border-stone-200/60">
          <span className="text-[9px] font-bold text-stone-400 block">12h</span>
          <span className="text-[10px] font-black text-stone-700 block">Glucógeno ↓</span>
        </div>
        <div className="p-1.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
          <span className="text-[9px] font-bold text-amber-600 block">14h</span>
          <span className="text-[10px] font-black text-amber-900 block">Quema Grasa</span>
        </div>
        <div className="p-1.5 rounded-xl bg-indigo-50/60 border border-indigo-200/60">
          <span className="text-[9px] font-bold text-indigo-600 block">16h</span>
          <span className="text-[10px] font-black text-indigo-900 block">Autofagia ★</span>
        </div>
      </div>
    </div>
  );
};
