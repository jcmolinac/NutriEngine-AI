"use client";

import React, { useState } from "react";
import { Scale, X, Check, Activity, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import { UserAntropoData, AjusteAdaptativoTDEE } from "@/types/nutrition";
import { calculateAdaptiveTDEE } from "@/lib/adaptive-tdee";

interface AdaptiveBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserAntropoData;
  currentBudget: number;
  onApplyNewBudget: (newBudget: number, newTdee: number) => void;
}

export const AdaptiveBudgetModal: React.FC<AdaptiveBudgetModalProps> = ({
  isOpen,
  onClose,
  userData,
  currentBudget,
  onApplyNewBudget,
}) => {
  const [semana, setSemana] = useState(2);
  const [nuevoPeso, setNuevoPeso] = useState(
    Number((userData.peso_actual_kg - 0.9).toFixed(1))
  );
  const [resultado, setResultado] = useState<AjusteAdaptativoTDEE | null>(null);

  const handleCalculate = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    const res = calculateAdaptiveTDEE({
      userData,
      presupuestoActual: currentBudget,
      pesajesRecientes: [
        { semanaNumero: semana, pesoRegistradoKg: nuevoPeso },
      ],
    });
    setResultado(res);
  };

  const handleApply = () => {
    if (!resultado) return;
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(35);
    }
    onApplyNewBudget(resultado.nuevo_presupuesto, resultado.nuevo_tdee);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-white rounded-4xl border border-stone-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-fitia-dark">
                Presupuesto Calórico Adaptativo
              </h3>
              <span className="text-[10px] text-stone-500 font-medium">
                Chequeo Clínico de Adaptación Metabólica
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Formulario de Pesaje de Control */}
          <div className="p-4 rounded-3xl bg-stone-50/80 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700">Semana del Programa</span>
              <div className="flex gap-1">
                {[1, 2, 4, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSemana(s)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                      semana === s
                        ? "bg-fitia-dark text-white border-fitia-dark"
                        : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    Sem {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                Peso actual en la báscula (kg):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={nuevoPeso}
                  onChange={(e) => setNuevoPeso(Number(e.target.value))}
                  className="w-full h-11 px-3 text-base font-black font-mono rounded-xl border border-stone-300 bg-white text-stone-900"
                />
                <span className="text-xs font-bold text-stone-500">kg</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Peso inicial de referencia: {userData.peso_actual_kg} kg (Meta: {userData.peso_meta_kg} kg)
              </p>
            </div>

            <button
              type="button"
              id="btn-evaluate-adaptive-tdee"
              onClick={handleCalculate}
              className="w-full h-11 rounded-2xl bg-fitia-yellow text-fitia-dark text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Activity className="w-4 h-4" />
              <span>Evaluar Adaptación y Recalibrar</span>
            </button>
          </div>

          {/* Resultados de la evaluación */}
          {resultado && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider">
                    Diagnóstico Metabólico
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-600">
                    Semana {semana}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center py-1">
                  <div className="p-2 rounded-2xl bg-white border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 block">Pérdida Real</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      -{(userData.peso_actual_kg - resultado.peso_real_kg).toFixed(1)} kg
                    </span>
                  </div>

                  <div className="p-2 rounded-2xl bg-white border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 block">Nuevo Presupuesto</span>
                    <span className="text-base font-black text-fitia-dark font-mono">
                      {resultado.nuevo_presupuesto} kcal
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-medium pt-1">
                  {resultado.diagnostico}
                </p>
              </div>

              <button
                type="button"
                id="btn-apply-adaptive-budget"
                onClick={handleApply}
                className="w-full h-12 rounded-2xl bg-fitia-dark text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
              >
                <Check className="w-4 h-4 text-fitia-yellow" />
                <span>Aplicar {resultado.nuevo_presupuesto} kcal/día a mi plan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
