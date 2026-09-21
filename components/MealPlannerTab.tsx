"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Flame,
  ShoppingCart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PlanComidas, DiaPlan } from "@/types/nutrition";

interface MealPlannerTabProps {
  planData: PlanComidas;
  onGeneratePlan: (calorieTarget?: number) => Promise<void>;
  onGenerateGroceryListFromPlan: (plan: PlanComidas) => Promise<void>;
  isProcessing: boolean;
}

export const MealPlannerTab: React.FC<MealPlannerTabProps> = ({
  planData,
  onGeneratePlan,
  onGenerateGroceryListFromPlan,
  isProcessing,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [targetCalories, setTargetCalories] = useState(1800);

  const dias = planData?.dias || [];
  const activeDia: DiaPlan | undefined = dias[selectedDayIndex] || dias[0];

  const handleDaySelect = (idx: number) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setSelectedDayIndex(idx);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2">
      {/* Target & Generation Card */}
      <div className="bg-fitia-cream rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider">
              Menú Semanal
            </span>
            <h3 className="text-base font-black text-fitia-dark leading-tight">
              Planificador Lunes a Domingo
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-fitia-surface text-stone-700 text-[10px] font-bold border border-stone-200">
            7 Días
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 flex items-center gap-1.5 bg-fitia-surface px-3 h-12 min-h-[44px] rounded-2xl border border-stone-200">
            <Flame className="w-4 h-4 text-fitia-green shrink-0" />
            <span className="text-xs text-stone-500 font-medium">Meta:</span>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-16 text-xs font-bold text-stone-900 bg-white px-2 py-1 rounded-lg border border-stone-300 text-center"
              min={1200}
              max={4000}
            />
            <span className="text-xs text-stone-500 font-semibold">kcal</span>
          </div>

          <button
            id="btn-generate-meal-plan"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(25);
              }
              onGeneratePlan(targetCalories);
            }}
            disabled={isProcessing}
            className="h-12 min-h-[44px] px-4 rounded-2xl bg-fitia-yellow hover:bg-[#F5BF00] active:scale-98 text-fitia-dark text-xs font-black flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
            <span>{isProcessing ? "Generando..." : "Regenerar"}</span>
          </button>
        </div>

        {/* Day Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
          {dias.map((d, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={idx}
                type="button"
                id={`tab-day-${d.dia.toLowerCase()}`}
                onClick={() => handleDaySelect(idx)}
                className={`flex flex-col items-center justify-center min-w-[76px] px-2 py-2 rounded-2xl text-xs transition-all min-h-[50px] shrink-0 ${
                  isSelected
                    ? "bg-fitia-yellow text-fitia-dark shadow-sm font-black"
                    : "bg-fitia-surface text-stone-700 border border-stone-200"
                }`}
              >
                <span className="font-black text-xs leading-none">{d.dia.slice(0, 3)}</span>
                <span
                  className={`text-[10px] font-mono mt-1 ${
                    isSelected ? "text-fitia-dark/80 font-bold" : "text-stone-500"
                  }`}
                >
                  {d.resumen_dia?.calorias || 0}k
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Content */}
      {activeDia ? (
        <div className="space-y-3">
          {/* Day Macro Overview Header */}
          <div className="bg-white rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fitia-green" />
                <h4 className="text-base font-black text-fitia-dark">{activeDia.dia}</h4>
              </div>
              <span className="text-xs font-mono font-black text-fitia-dark bg-fitia-surface px-2.5 py-1 rounded-xl border border-stone-200">
                {activeDia.resumen_dia?.calorias} kcal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs font-mono">
              <div className="p-2 rounded-2xl bg-macro-protein/10 border border-macro-protein/25">
                <span className="text-[9px] text-macro-protein font-bold block">Proteína</span>
                <span className="font-bold text-fitia-dark">{activeDia.resumen_dia?.proteinas_g}g</span>
              </div>
              <div className="p-2 rounded-2xl bg-macro-carbs/15 border border-macro-carbs/35">
                <span className="text-[9px] text-[#A86F28] font-bold block">Carbos</span>
                <span className="font-bold text-fitia-dark">{activeDia.resumen_dia?.carbs_g}g</span>
              </div>
              <div className="p-2 rounded-2xl bg-macro-fat/15 border border-macro-fat/35">
                <span className="text-[9px] text-[#635F2B] font-bold block">Grasas</span>
                <span className="font-bold text-fitia-dark">{activeDia.resumen_dia?.grasas_g}g</span>
              </div>
            </div>
          </div>

          {/* Meals Stack (Desayuno, Almuerzo, Cena) */}
          <div className="space-y-2.5">
            {activeDia.comidas?.map((comida, cIdx) => (
              <div
                key={cIdx}
                className="bg-white rounded-4xl border border-stone-200/90 p-4 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      comida.tipo === "Desayuno"
                        ? "bg-amber-100 text-amber-900"
                        : comida.tipo === "Almuerzo"
                        ? "bg-fitia-yellow/30 text-fitia-dark"
                        : "bg-fitia-surface text-stone-800"
                    }`}
                  >
                    {comida.tipo}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {comida.tiempo_preparacion_min} min prep
                  </span>
                </div>

                <h5 className="text-sm font-bold text-fitia-dark leading-snug">
                  {comida.nombre_receta}
                </h5>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="font-mono font-black text-fitia-dark">{comida.calorias} kcal</span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500">
                    <span className="text-macro-protein font-bold">{comida.proteinas_g}g P</span>
                    <span>•</span>
                    <span className="text-[#A86F28] font-bold">{comida.carbs_g}g C</span>
                    <span>•</span>
                    <span className="text-[#635F2B] font-bold">{comida.grasas_g}g G</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connected Action 5: Smart Grocery List button */}
          <div className="p-4 rounded-4xl bg-fitia-dark text-stone-100 space-y-2.5 shadow-md">
            <div className="flex items-center gap-1.5 text-fitia-yellow text-xs font-bold uppercase tracking-wider">
              <ShoppingCart className="w-4 h-4" />
              <span>Lista de Compras Inteligente</span>
            </div>
            <p className="text-xs text-stone-300">
              Consolida todos los ingredientes del menú semanal agrupados por pasillo de supermercado.
            </p>
            <button
              type="button"
              id="btn-trigger-smart-grocery-list"
              onClick={() => {
                if (typeof window !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate?.(25);
                }
                onGenerateGroceryListFromPlan(planData);
              }}
              disabled={isProcessing}
              className="w-full h-12 min-h-[44px] rounded-2xl bg-fitia-yellow hover:bg-[#F5BF00] active:scale-98 text-fitia-dark text-xs font-black flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <span>Generar Lista de Compras</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-4xl border border-dashed border-stone-300 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-fitia-yellow/30 text-fitia-dark flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6 text-fitia-dark" />
          </div>
          <div>
            <h4 className="text-sm font-black text-fitia-dark">Menú Semanal no Generado</h4>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Ajusta tus calorías deseadas arriba y pulsa <strong>Generar</strong> para crear tu plan de comidas de 7 días.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
