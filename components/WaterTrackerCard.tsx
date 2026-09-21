"use client";

import React from "react";
import { Droplets, Plus, Minus, CheckCircle2, Sparkles } from "lucide-react";

interface WaterTrackerCardProps {
  metaMl?: number;
  consumidoMl: number;
  onAddWater: (ml: number) => void;
  onResetWater?: () => void;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({
  metaMl = 2000,
  consumidoMl,
  onAddWater,
  onResetWater,
}) => {
  const pct = Math.min(100, Math.round((consumidoMl / metaMl) * 100)) || 0;
  const targetLiters = (metaMl / 1000).toFixed(1);
  const currentLiters = (consumidoMl / 1000).toFixed(2);
  const restantesMl = Math.max(0, metaMl - consumidoMl);

  const handleAdd = (amount: number) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    onAddWater(amount);
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-100 p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
            <Droplets className="w-4 h-4 fill-sky-500 text-sky-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
              Hidratación Diaria
            </span>
            <h4 className="text-sm font-black text-fitia-dark">
              Agua & Electrolitos
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-sky-700 font-mono">
            {currentLiters} <span className="text-xs font-medium text-stone-400">/ {targetLiters} L</span>
          </span>
          <span className="text-[10px] font-bold text-sky-600 block">
            {pct}% de la meta
          </span>
        </div>
      </div>

      {/* Barra de progreso de agua con efecto de onda */}
      <div className="relative w-full h-3.5 bg-sky-100/60 rounded-full overflow-hidden border border-sky-200/50">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Botones de acción rápida de ingesta */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        <button
          type="button"
          id="btn-add-water-250"
          onClick={() => handleAdd(250)}
          className="py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 text-xs font-bold flex flex-col items-center justify-center border border-sky-200/60 transition"
        >
          <span className="text-[10px] text-sky-600 font-medium">Vaso</span>
          <span>+250 ml</span>
        </button>

        <button
          type="button"
          id="btn-add-water-500"
          onClick={() => handleAdd(500)}
          className="py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 text-xs font-bold flex flex-col items-center justify-center border border-sky-200/60 transition"
        >
          <span className="text-[10px] text-sky-600 font-medium">Botella</span>
          <span>+500 ml</span>
        </button>

        <button
          type="button"
          id="btn-add-water-1000"
          onClick={() => handleAdd(1000)}
          className="py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 text-xs font-bold flex flex-col items-center justify-center border border-sky-200/60 transition"
        >
          <span className="text-[10px] text-sky-600 font-medium">Jarra</span>
          <span>+1.0 L</span>
        </button>

        <button
          type="button"
          id="btn-sub-water-250"
          onClick={() => handleAdd(-250)}
          disabled={consumidoMl <= 0}
          className="py-2 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-600 text-xs font-bold flex flex-col items-center justify-center border border-stone-200 transition disabled:opacity-35"
        >
          <span className="text-[10px] text-stone-400 font-medium">Corregir</span>
          <span>-250 ml</span>
        </button>
      </div>

      {/* Tip clínico de hidratación */}
      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-0.5">
        {pct >= 100 ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-emerald-700 font-medium">¡Objetivo alcanzado! Óptima filtración renal y saciedad.</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>Faltan {restantesMl} ml. La hidratación previene la falsa señal de hambre.</span>
          </>
        )}
      </div>
    </div>
  );
};
