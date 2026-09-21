"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  Activity,
  FileText,
  Sparkles,
} from "lucide-react";
import { MetasYProgreso, UserAntropoData } from "@/types/nutrition";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { MacroBar } from "./MacroBar";
import { CalorieGauge } from "./CalorieGauge";
import { WeightCurveChart } from "./WeightCurveChart";
import { ClinicalReportModal } from "./ClinicalReportModal";
import { AdaptiveBudgetModal } from "./AdaptiveBudgetModal";

interface CalculateTargetsTabProps {
  metasData: MetasYProgreso;
  onCalculateTargets: (userData: UserAntropoData) => Promise<void>;
  isProcessing: boolean;
}

export const CalculateTargetsTab: React.FC<CalculateTargetsTabProps> = ({
  metasData,
  onCalculateTargets,
  isProcessing,
}) => {
  const [formData, setFormData] = useState<UserAntropoData>({
    edad: 42,
    genero: "masculino",
    peso_actual_kg: 95,
    altura_cm: 183,
    nivel_actividad: "sedentario",
    peso_meta_kg: 82,
  });

  const [showTimelineSheet, setShowTimelineSheet] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdaptiveModal, setShowAdaptiveModal] = useState(false);

  const handleChange = (field: keyof UserAntropoData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    onCalculateTargets(formData);
  };

  const applyPreset = (preset: UserAntropoData) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setFormData(preset);
    onCalculateTargets(preset);
  };

  const {
    calorias_diarias_recomendadas = 1817,
    rango_calorico,
    macros_objetivo,
    curva_progreso,
    tasa_metabolica_basal_bmr = 1889,
    gasto_energetico_total_tdee = 2267,
  } = metasData;

  const displayBmr = tasa_metabolica_basal_bmr || Math.round(calorias_diarias_recomendadas * 0.83);
  const displayTdee = gasto_energetico_total_tdee || Math.round(calorias_diarias_recomendadas * 1.25);
  const calculatedDeficit = displayTdee - calorias_diarias_recomendadas;

  // Chart SVG calculations
  const points = curva_progreso || [];
  const weights = points.map((p) => p.peso_proyectado_kg);
  const minW = weights.length > 0 ? Math.min(...weights) - 0.5 : 60;
  const maxW = weights.length > 0 ? Math.max(...weights) + 0.5 : 75;
  const rangeW = maxW - minW || 1;

  const svgWidth = 360;
  const svgHeight = 160;
  const padX = 35;
  const padY = 25;

  const getSvgX = (index: number) => {
    if (points.length <= 1) return padX;
    return padX + (index / (points.length - 1)) * (svgWidth - padX * 2);
  };

  const getSvgY = (weight: number) => {
    const norm = (weight - minW) / rangeW;
    return svgHeight - padY - norm * (svgHeight - padY * 2);
  };

  const pathD = points.reduce((acc, pt, idx) => {
    const x = getSvgX(idx);
    const y = getSvgY(pt.peso_proyectado_kg);
    return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, "");

  const areaD =
    points.length > 1
      ? `${pathD} L ${getSvgX(points.length - 1)},${svgHeight - padY} L ${getSvgX(0)},${
          svgHeight - padY
        } Z`
      : "";

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2">
      {/* Anthropometric Calculator Card */}
      <div className="bg-fitia-cream rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-fitia-green tracking-wider uppercase">
              Parámetros
            </span>
            <h3 className="text-base font-black text-fitia-dark leading-tight">
              Datos Antropométricos
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-fitia-surface text-stone-700 text-[10px] font-bold border border-stone-200">
            Harris-Benedict
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Quick Presets Carousel */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              id="preset-user-42m"
              onClick={() =>
                applyPreset({
                  edad: 42,
                  genero: "masculino",
                  peso_actual_kg: 95,
                  altura_cm: 183,
                  nivel_actividad: "sedentario",
                  peso_meta_kg: 82,
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-fitia-yellow/30 border border-fitia-yellow/60 active:bg-fitia-yellow text-fitia-dark text-xs font-bold whitespace-nowrap min-h-[36px]"
            >
              ★ Hombre 42a (95→82kg Sedentario)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  edad: 32,
                  genero: "femenino",
                  peso_actual_kg: 72,
                  altura_cm: 167,
                  nivel_actividad: "moderado",
                  peso_meta_kg: 64,
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-700 text-xs font-semibold whitespace-nowrap min-h-[36px]"
            >
              Definición 72→64kg
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  edad: 26,
                  genero: "masculino",
                  peso_actual_kg: 84,
                  altura_cm: 181,
                  nivel_actividad: "intenso",
                  peso_meta_kg: 80,
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-700 text-xs font-semibold whitespace-nowrap min-h-[36px]"
            >
              Atleta 84→80kg
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  edad: 40,
                  genero: "femenino",
                  peso_actual_kg: 60,
                  altura_cm: 162,
                  nivel_actividad: "ligero",
                  peso_meta_kg: 60,
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-700 text-xs font-semibold whitespace-nowrap min-h-[36px]"
            >
              Mantenimiento
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Edad</label>
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange("edad", Number(e.target.value))}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-3 text-xs font-semibold text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Género</label>
              <select
                value={formData.genero}
                onChange={(e) => handleChange("genero", e.target.value)}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-2.5 text-xs font-semibold text-stone-900 bg-stone-50/50"
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Peso Actual (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.peso_actual_kg}
                onChange={(e) => handleChange("peso_actual_kg", Number(e.target.value))}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-3 text-xs font-semibold text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Altura (cm)</label>
              <input
                type="number"
                value={formData.altura_cm}
                onChange={(e) => handleChange("altura_cm", Number(e.target.value))}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-3 text-xs font-semibold text-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Actividad</label>
              <select
                value={formData.nivel_actividad}
                onChange={(e) => handleChange("nivel_actividad", e.target.value)}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-2 text-xs font-semibold text-stone-900 bg-stone-50/50"
              >
                <option value="sedentario">Sedentario</option>
                <option value="ligero">Ligero</option>
                <option value="moderado">Moderado</option>
                <option value="intenso">Intenso</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Peso Meta (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.peso_meta_kg}
                onChange={(e) => handleChange("peso_meta_kg", Number(e.target.value))}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-3 text-xs font-semibold text-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-recalculate-targets"
            disabled={isProcessing}
            className="w-full h-12 min-h-[44px] rounded-2xl bg-fitia-yellow hover:bg-[#F5BF00] active:scale-98 text-fitia-dark text-xs font-black flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
            <span>{isProcessing ? "Calculando BMR / TDEE..." : "Calcular Presupuesto & Curva"}</span>
          </button>
        </form>
      </div>

      {/* Calorie Gauge Card */}
      <CalorieGauge
        currentKcal={calorias_diarias_recomendadas}
        minKcal={rango_calorico?.min || calorias_diarias_recomendadas - 150}
        maxKcal={rango_calorico?.max || calorias_diarias_recomendadas + 150}
        proteinGrams={macros_objetivo?.proteinas_g || 0}
        carbsGrams={macros_objetivo?.carbohidratos_g || 0}
        fatGrams={macros_objetivo?.grasas_g || 0}
      />

      {/* Metabolic Targets Result Card */}
      <div className="bg-white rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider">
              Presupuesto Diario
            </span>
            <h3 className="text-xl font-black text-fitia-dark leading-none mt-0.5">
              {calorias_diarias_recomendadas} <span className="text-xs font-bold text-stone-400">kcal/día</span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-fitia-dark bg-fitia-surface px-2 py-1 rounded-xl">
              {rango_calorico?.min || calorias_diarias_recomendadas - 100} - {rango_calorico?.max || calorias_diarias_recomendadas + 100} kcal
            </span>
          </div>
        </div>

        {/* BMR / TDEE / Deficit Triad */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl bg-fitia-surface border border-stone-200 text-center">
            <span className="text-[9px] font-bold text-stone-500 uppercase block">BMR Basal</span>
            <p className="text-sm font-black text-fitia-dark font-mono">{displayBmr}</p>
            <span className="text-[9px] text-stone-400">kcal</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
            <span className="text-[9px] font-bold text-emerald-800 uppercase block">TDEE Total</span>
            <p className="text-sm font-black text-emerald-950 font-mono">{displayTdee}</p>
            <span className="text-[9px] text-emerald-600">kcal</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
            <span className="text-[9px] font-bold text-amber-800 uppercase block">Déficit</span>
            <p className="text-sm font-black text-amber-950 font-mono">
              {calculatedDeficit > 0 ? `-${calculatedDeficit}` : `+${Math.abs(calculatedDeficit)}`}
            </p>
            <span className="text-[9px] text-amber-600">kcal</span>
          </div>
        </div>

        {/* Target Macros Distribution */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Objetivo Diario de Macronutrientes</span>
            <span>Gramos / Día</span>
          </div>

          <MacroBar
            proteinPct={Math.round(((macros_objetivo?.proteinas_g * 4) / (calorias_diarias_recomendadas || 1)) * 100) || 0}
            carbsPct={Math.round(((macros_objetivo?.carbohidratos_g * 4) / (calorias_diarias_recomendadas || 1)) * 100) || 0}
            fatPct={Math.round(((macros_objetivo?.grasas_g * 9) / (calorias_diarias_recomendadas || 1)) * 100) || 0}
          />

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl bg-macro-protein/10 border border-macro-protein/25 text-center">
              <span className="text-[9px] font-bold text-macro-protein uppercase block">Proteína</span>
              <p className="text-sm font-black text-fitia-dark font-mono">
                {macros_objetivo?.proteinas_g}g
              </p>
              <span className="text-[9px] text-macro-protein font-semibold">
                {Math.round(((macros_objetivo?.proteinas_g * 4) / (calorias_diarias_recomendadas || 1)) * 100)}%
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-macro-carbs/15 border border-macro-carbs/35 text-center">
              <span className="text-[9px] font-bold text-[#A86F28] uppercase block">Carbos</span>
              <p className="text-sm font-black text-fitia-dark font-mono">
                {macros_objetivo?.carbohidratos_g}g
              </p>
              <span className="text-[9px] text-[#A86F28] font-semibold">
                {Math.round(((macros_objetivo?.carbohidratos_g * 4) / (calorias_diarias_recomendadas || 1)) * 100)}%
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-macro-fat/15 border border-macro-fat/35 text-center">
              <span className="text-[9px] font-bold text-[#635F2B] uppercase block">Grasas</span>
              <p className="text-sm font-black text-fitia-dark font-mono">
                {macros_objetivo?.grasas_g}g
              </p>
              <span className="text-[9px] text-[#635F2B] font-semibold">
                {Math.round(((macros_objetivo?.grasas_g * 9) / (calorias_diarias_recomendadas || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Herramientas Clínicas Avanzadas */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          id="btn-open-clinical-report"
          onClick={() => {
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(20);
            }
            setShowReportModal(true);
          }}
          className="p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 active:scale-95 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Reporte Clínico PDF</span>
        </button>

        <button
          type="button"
          id="btn-open-adaptive-budget"
          onClick={() => {
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(20);
            }
            setShowAdaptiveModal(true);
          }}
          className="p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 active:scale-95 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Chequeo Adaptativo</span>
        </button>
      </div>

      {/* Fitia Weight Curve Visual Chart */}
      <WeightCurveChart
        currentWeight={formData.peso_actual_kg}
        targetWeight={formData.peso_meta_kg}
        targetDate={points[points.length - 1]?.fecha_estimada || "Semana 12"}
      />

      {/* Curva de Progreso Semanal */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Curva de Proyección
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(20);
              }
              setShowTimelineSheet(true);
            }}
            className="text-[11px] text-emerald-700 font-bold hover:underline min-h-[36px] flex items-center"
          >
            Ver Hitos Detallados &rarr;
          </button>
        </div>

        {/* Responsive Mobile SVG Chart */}
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-2 overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            <defs>
              <linearGradient id="curveGradientMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0.25, 0.5, 0.75].map((factor, i) => (
              <line
                key={i}
                x1={padX}
                y1={padY + factor * (svgHeight - padY * 2)}
                x2={svgWidth - padX}
                y2={padY + factor * (svgHeight - padY * 2)}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#curveGradientMobile)" />}

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Milestone Points */}
            {points.map((pt, idx) => {
              const x = getSvgX(idx);
              const y = getSvgY(pt.peso_proyectado_kg);
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#1c1917"
                  >
                    {pt.peso_proyectado_kg}k
                  </text>
                  <text
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="medium"
                    fill="#78716c"
                  >
                    H{idx + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Timeline Milestones Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showTimelineSheet}
        onClose={() => setShowTimelineSheet(false)}
        title="Hitos Semanales de Progreso"
        subtitle={`Proyección hacia meta de ${formData.peso_meta_kg} kg`}
      >
        <div className="space-y-2.5 py-1">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono">
                  H{idx + 1}
                </div>
                <div>
                  <h5 className="font-bold text-stone-900">{pt.etiqueta || `Hito ${idx + 1}`}</h5>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {pt.fecha_estimada ? `${pt.fecha_estimada} • ` : ""}Objetivo: {pt.peso_proyectado_kg} kg
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 font-mono block">
                  {Math.round(calculatedDeficit * 7)}
                </span>
                <span className="text-[9px] font-semibold text-stone-400 uppercase">kcal def</span>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setShowTimelineSheet(false)}
            className="w-full h-12 min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition mt-2"
          >
            Cerrar Hitos
          </button>
        </div>
      </MobileBottomSheet>

      {/* Modal de Reporte Clínico Oficial */}
      <ClinicalReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userData={formData}
        metasData={metasData}
      />

      {/* Modal de Presupuesto Adaptativo Semanal */}
      <AdaptiveBudgetModal
        isOpen={showAdaptiveModal}
        onClose={() => setShowAdaptiveModal(false)}
        userData={formData}
        currentBudget={calorias_diarias_recomendadas}
        onApplyNewBudget={(newBudget, newTdee) => {
          onCalculateTargets({
            ...formData,
          });
        }}
      />
    </div>
  );
};
