"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Flame,
  ShoppingCart,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { PlanComidas, DiaPlan, CategoriaCompra } from "@/types/nutrition";
import {
  CLINICAL_INGREDIENTS,
  DEFAULT_SELECTED_INGREDIENTS,
} from "@/lib/meal-planner-generator";

interface MealPlannerTabProps {
  planData: PlanComidas;
  groceryData?: CategoriaCompra[];
  onGeneratePlan: (calorieTarget?: number, selectedFoods?: string[]) => Promise<void>;
  onGenerateGroceryListFromPlan?: (plan: PlanComidas) => Promise<void>;
  isProcessing: boolean;
}

export const MealPlannerTab: React.FC<MealPlannerTabProps> = ({
  planData,
  groceryData = [],
  onGeneratePlan,
  isProcessing,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [targetCalories, setTargetCalories] = useState(1800);
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    DEFAULT_SELECTED_INGREDIENTS
  );
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const dias = planData?.dias || [];
  const activeDia: DiaPlan | undefined = dias[selectedDayIndex] || dias[0];

  const handleDaySelect = (idx: number) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setSelectedDayIndex(idx);
  };

  const toggleIngredient = (id: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(15);
    }
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllIngredients = () => {
    setSelectedIngredientIds(CLINICAL_INGREDIENTS.map((i) => i.id));
  };

  const selectBasics = () => {
    setSelectedIngredientIds(DEFAULT_SELECTED_INGREDIENTS);
  };

  const clearIngredients = () => {
    setSelectedIngredientIds([]);
  };

  const toggleGroceryChecked = (key: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(15);
    }
    setCheckedGroceryItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyGroceryText = () => {
    let text = "🛒 *LISTA DE COMPRAS SEMANAL - NUTRIENGINE AI*\n\n";
    groceryData.forEach((cat) => {
      text += `📍 *${cat.categoria}*\n`;
      cat.items?.forEach((it) => {
        text += ` • ${it.alimento}: ${it.cantidad_total}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(30);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalGroceryCount = groceryData.reduce((acc, c) => acc + (c.items?.length || 0), 0);
  const purchasedCount = Object.values(checkedGroceryItems).filter(Boolean).length;
  const progressPct =
    totalGroceryCount > 0 ? Math.round((purchasedCount / totalGroceryCount) * 100) : 0;

  // Agrupar alimentos por categoría para el selector
  const categories = [
    { key: "proteinas", label: "🥩 Proteínas (BEDCA/USDA)" },
    { key: "carbohidratos", label: "🍚 Carbohidratos & Granos" },
    { key: "vegetales", label: "🥦 Vegetales & Fibra" },
    { key: "grasas", label: "🥑 Grasas Saludables" },
  ] as const;

  return (
    <div className="w-full max-w-md mx-auto space-y-3.5 pb-20">
      {/* 1. SELECTOR DE ALIMENTOS PREFERIDOS */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => setIsIngredientsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-stone-900">
                  Tus Alimentos Preferidos
                </h4>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">
                  {selectedIngredientIds.length} elegidos
                </span>
              </div>
              <p className="text-[10px] text-stone-500">
                Elige qué comer y el menú semanal se creará solo con ellos
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-200 transition">
            {isIngredientsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isIngredientsOpen && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            {/* Botones de acción rápida */}
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-[10px] font-semibold text-stone-400">Atajos:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={selectBasics}
                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700 transition"
                >
                  Básicos
                </button>
                <button
                  type="button"
                  onClick={selectAllIngredients}
                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700 transition"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={clearIngredients}
                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-500 transition"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Listado agrupado por categorías */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const itemsInCat = CLINICAL_INGREDIENTS.filter((i) => i.category === cat.key);
                return (
                  <div key={cat.key} className="space-y-1">
                    <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">
                      {cat.label}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {itemsInCat.map((item) => {
                        const isSelected = selectedIngredientIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleIngredient(item.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition active:scale-95 border ${
                              isSelected
                                ? "bg-fitia-dark text-white border-fitia-dark shadow-2xs font-bold"
                                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 text-fitia-yellow ml-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. OBJETIVO CALÓRICO Y GENERADOR DEL MENÚ */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider">
              Menú Semanal Personalizado
            </span>
            <h3 className="text-base font-black text-fitia-dark leading-tight">
              Plan Lunes a Domingo
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-black border border-stone-200">
            7 Días
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 flex items-center gap-1.5 bg-stone-50 px-3 h-11 rounded-2xl border border-stone-200">
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs text-stone-500 font-semibold">Meta:</span>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-16 text-xs font-bold text-stone-900 bg-white px-2 py-1 rounded-lg border border-stone-300 text-center focus:outline-none focus:border-fitia-yellow"
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
              onGeneratePlan(targetCalories, selectedIngredientIds);
            }}
            disabled={isProcessing}
            className="h-11 px-4 rounded-2xl bg-fitia-yellow hover:bg-[#F5BF00] active:scale-95 text-fitia-dark text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            <span>
              {isProcessing
                ? "Generando..."
                : dias.length > 0
                ? "Regenerar"
                : "Generar Menú"}
            </span>
          </button>
        </div>

        {/* Day Selector Chips (Lunes a Domingo) */}
        {dias.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
            {dias.map((d, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  id={`tab-day-${d.dia.toLowerCase()}`}
                  onClick={() => handleDaySelect(idx)}
                  className={`flex flex-col items-center justify-center min-w-[50px] flex-1 py-1.5 px-1 rounded-2xl text-xs transition-all border ${
                    isSelected
                      ? "bg-fitia-dark text-white border-fitia-dark shadow-sm font-black"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-fitia-yellow" : "text-stone-400"
                    }`}
                  >
                    {d.dia.slice(0, 3)}
                  </span>
                  <span className="text-xs font-mono font-black mt-0.5">
                    {Math.round((d.resumen_dia?.calorias || 0) / 100) * 100}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DÍA SELECCIONADO Y SUS COMIDAS */}
      {activeDia ? (
        <div className="space-y-3">
          {/* Macro Overview Header */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-black text-fitia-dark">{activeDia.dia}</h4>
              </div>
              <span className="text-xs font-mono font-black text-fitia-dark bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200">
                {activeDia.resumen_dia?.calorias} kcal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs font-mono">
              <div className="p-2 rounded-2xl bg-rose-50 border border-rose-100">
                <span className="text-[9px] text-rose-700 font-bold block">Proteína</span>
                <span className="font-black text-stone-900">
                  {activeDia.resumen_dia?.proteinas_g}g
                </span>
              </div>
              <div className="p-2 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[9px] text-amber-700 font-bold block">Carbos</span>
                <span className="font-black text-stone-900">
                  {activeDia.resumen_dia?.carbs_g}g
                </span>
              </div>
              <div className="p-2 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[9px] text-emerald-700 font-bold block">Grasas</span>
                <span className="font-black text-stone-900">
                  {activeDia.resumen_dia?.grasas_g}g
                </span>
              </div>
            </div>
          </div>

          {/* Meals Stack (Desayuno, Almuerzo, Cena) */}
          <div className="space-y-2.5">
            {activeDia.comidas?.map((comida, cIdx) => (
              <div
                key={cIdx}
                className="bg-white rounded-3xl border border-stone-200/90 p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      comida.tipo === "Desayuno"
                        ? "bg-amber-100 text-amber-900"
                        : comida.tipo === "Almuerzo"
                        ? "bg-fitia-yellow/30 text-stone-900"
                        : "bg-indigo-50 text-indigo-900"
                    }`}
                  >
                    {comida.tipo}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {comida.tiempo_preparacion_min} min
                  </span>
                </div>

                <h5 className="text-xs font-bold text-stone-900 leading-snug">
                  {comida.nombre_receta}
                </h5>

                <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-xs">
                  <span className="font-mono font-black text-stone-900">
                    {comida.calorias} kcal
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500">
                    <span className="text-rose-700 font-bold">{comida.proteinas_g}g P</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">{comida.carbs_g}g C</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{comida.grasas_g}g G</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. LISTA DE COMPRAS INTEGRADA */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-4 space-y-3 shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate?.(20);
                }
                setIsGroceryOpen((prev) => !prev);
              }}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-fitia-yellow/20 flex items-center justify-center text-fitia-dark">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">
                    Lista de Compras de la Semana
                  </h4>
                  <p className="text-[10px] text-stone-500">
                    {totalGroceryCount > 0
                      ? `${purchasedCount} de ${totalGroceryCount} artículos comprados`
                      : "Generada con tus alimentos seleccionados"}
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-200 transition">
                {isGroceryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isGroceryOpen && (
              <div className="space-y-3 pt-2 border-t border-stone-100">
                {groceryData.length > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className="h-full rounded-full bg-fitia-yellow transition-all duration-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyGroceryText}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-[11px] font-bold flex items-center gap-1.5 transition"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                      )}
                      <span>{copied ? "¡Copiada!" : "Copiar para WhatsApp"}</span>
                    </button>
                  </div>
                )}

                {groceryData.length > 0 ? (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {groceryData.map((cat, cIdx) => (
                      <div
                        key={cIdx}
                        className="space-y-1 bg-stone-50/70 p-2.5 rounded-2xl border border-stone-200/70"
                      >
                        <span className="text-[10px] font-black text-stone-800 uppercase tracking-wider block">
                          {cat.categoria}
                        </span>
                        <div className="space-y-1 pt-1">
                          {cat.items?.map((it, itIdx) => {
                            const key = `${cat.categoria}-${itIdx}`;
                            const isChecked = !!checkedGroceryItems[key];
                            return (
                              <button
                                key={itIdx}
                                type="button"
                                onClick={() => toggleGroceryChecked(key)}
                                className="w-full flex items-center justify-between text-left py-1 px-1 rounded-lg hover:bg-white/80 transition"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                  {isChecked ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  )}
                                  <span
                                    className={`text-xs truncate ${
                                      isChecked
                                        ? "line-through text-stone-400"
                                        : "text-stone-800 font-medium"
                                    }`}
                                  >
                                    {it.alimento}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-stone-500 shrink-0 font-semibold">
                                  {it.cantidad_total}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 text-center py-2">
                    Pulsa &quot;Generar Menú&quot; arriba para calcular los ingredientes de la semana.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-fitia-yellow/20 text-fitia-dark flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6 text-fitia-dark" />
          </div>
          <div>
            <h4 className="text-sm font-black text-fitia-dark">Menú Semanal no Generado</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Selecciona tus alimentos arriba y pulsa <strong>Generar Menú</strong> para crear tu plan de comidas de 7 días.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
