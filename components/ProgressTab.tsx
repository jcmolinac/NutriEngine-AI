"use client";

import React, { useState } from "react";
import {
  Scale,
  TrendingDown,
  Calendar,
  Flame,
  Award,
  CheckCircle2,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { MetasYProgreso, RegistroDiario } from "@/types/nutrition";

interface ProgressTabProps {
  metasData?: MetasYProgreso;
  currentWeight?: number;
  targetWeight?: number;
  historialDias?: Record<string, RegistroDiario>;
  onLogWeight?: (weight: number, dateIso: string) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  metasData,
  currentWeight = 78.0,
  targetWeight = 72.0,
  historialDias = {},
  onLogWeight,
}) => {
  const [weightInput, setWeightInput] = useState<number | "">(currentWeight);
  const [weightHistory, setWeightHistory] = useState<
    Array<{ fecha: string; peso: number; diff: number }>
  >([
    { fecha: "15 Sep", peso: 79.2, diff: 0 },
    { fecha: "18 Sep", peso: 78.6, diff: -0.6 },
    { fecha: "20 Sep", peso: 78.2, diff: -0.4 },
    { fecha: "Hoy", peso: currentWeight, diff: -0.2 },
  ]);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightInput === "" || Number(weightInput) <= 0) return;

    const w = Number(weightInput);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }

    const last = weightHistory[weightHistory.length - 1]?.peso || w;
    const diff = Number((w - last).toFixed(1));

    setWeightHistory((prev) => [...prev, { fecha: "Hoy", peso: w, diff }]);
    onLogWeight?.(w, new Date().toISOString().split("T")[0]);
  };

  const targetKcal = metasData?.calorias_diarias_recomendadas || 2000;
  const startWeight = weightHistory.length > 0 ? weightHistory[0].peso : currentWeight;
  const lostWeight = Number((startWeight - currentWeight).toFixed(1));
  const remainingWeight = Number(Math.max(0, currentWeight - targetWeight).toFixed(1));
  const totalGoalDiff = Math.max(0.1, startWeight - targetWeight);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((lostWeight / totalGoalDiff) * 100))
  );

  // Días de la semana para el gráfico de barras calórico
  const weekDays = [
    { label: "Lun", cal: 1950, isGoal: true },
    { label: "Mar", cal: 2020, isGoal: true },
    { label: "Mié", cal: 1880, isGoal: true },
    { label: "Jue", cal: 2150, isGoal: true },
    { label: "Vie", cal: 1920, isGoal: true },
    { label: "Sáb", cal: 2200, isGoal: false },
    { label: "Hoy", cal: 1850, isGoal: true },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-3.5 pb-24 select-none">
      {/* 1. RESUMEN DE PROGRESO DE PESO */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider block">
                Objetivo Corporal
              </span>
              <h3 className="text-sm font-black text-stone-900 leading-tight">
                Progreso de Pérdida de Grasa
              </h3>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
            -{lostWeight > 0 ? lostWeight : 1.2} kg logrados
          </span>
        </div>

        {/* Métricas de peso actual vs objetivo */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
          <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-[9px] text-stone-400 font-bold block">Inicial</span>
            <span className="text-sm font-black text-stone-700">79.2 kg</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/80">
            <span className="text-[9px] text-amber-800 font-bold block">Actual</span>
            <span className="text-sm font-black text-amber-950">{currentWeight} kg</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[9px] text-emerald-800 font-bold block">Meta</span>
            <span className="text-sm font-black text-emerald-950">{targetWeight} kg</span>
          </div>
        </div>

        {/* Barra de progreso hacia la meta */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
            <span>Faltan {remainingWeight} kg para la meta</span>
            <span className="font-black text-stone-900 font-mono">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              style={{ width: `${Math.max(15, progressPct)}%` }}
              className="h-full rounded-full bg-fitia-yellow transition-all duration-500"
            />
          </div>
        </div>

        {/* Formulario rápido para anotar peso de hoy */}
        <form onSubmit={handleAddWeight} className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <div className="flex-1 flex items-center gap-1.5 bg-stone-50 px-3 h-10 rounded-2xl border border-stone-200">
            <Scale className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-[11px] text-stone-500 font-semibold">Peso hoy:</span>
            <input
              type="number"
              step="0.1"
              value={weightInput === "" ? "" : weightInput}
              onChange={(e) => setWeightInput(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-16 text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded-lg border border-stone-300 text-center focus:outline-none focus:border-fitia-yellow font-mono"
            />
            <span className="text-[11px] text-stone-400 font-semibold">kg</span>
          </div>
          <button
            type="submit"
            className="h-10 px-3.5 rounded-2xl bg-fitia-dark hover:bg-stone-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1 transition shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-fitia-yellow" />
            <span>Anotar</span>
          </button>
        </form>
      </div>

      {/* 2. ADHERENCIA CALÓRICA SEMANAL (7 DÍAS) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <Flame className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider block">
                Balance Energético
              </span>
              <h3 className="text-sm font-black text-stone-900 leading-tight">
                Consumo vs Meta ({targetKcal} kcal)
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xl border border-emerald-100">
            86% Adherencia
          </span>
        </div>

        {/* Gráfico de barras de los 7 días */}
        <div className="grid grid-cols-7 gap-1.5 pt-2 items-end h-28 border-b border-stone-100 pb-2">
          {weekDays.map((d, i) => {
            const heightPct = Math.min(100, Math.round((d.cal / (targetKcal * 1.2)) * 100));
            return (
              <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-mono text-stone-400 font-bold leading-none">
                  {Math.round(d.cal / 100) * 100}
                </span>
                <div className="w-full max-w-[28px] h-full bg-stone-100 rounded-xl overflow-hidden flex flex-col justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-xl transition-all duration-300 ${
                      d.label === "Hoy"
                        ? "bg-fitia-yellow"
                        : d.isGoal
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold leading-none ${
                    d.label === "Hoy" ? "text-amber-800 font-black" : "text-stone-500"
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. HISTORIAL DE PESAJE RECIENTE */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            Historial de Pesajes
          </h4>
          <span className="text-[10px] text-stone-400 font-medium">Últimos registros</span>
        </div>

        <div className="space-y-1.5">
          {weightHistory.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50/70 border border-stone-100 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-bold text-stone-800">{item.fecha}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-black text-stone-900">{item.peso} kg</span>
                {item.diff !== 0 && (
                  <span
                    className={`text-[10px] font-bold flex items-center ${
                      item.diff < 0 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {item.diff < 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                    {Math.abs(item.diff)} kg
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
