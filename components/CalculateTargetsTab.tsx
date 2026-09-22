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
  perfilUsuario?: UserAntropoData | null;
  onCalculateTargets: (userData: UserAntropoData) => Promise<void>;
  onResetTargets?: () => void;
  isProcessing: boolean;
}

export const CalculateTargetsTab: React.FC<CalculateTargetsTabProps> = ({
  metasData,
  perfilUsuario,
  onCalculateTargets,
  onResetTargets,
  isProcessing,
}) => {
  const [formData, setFormData] = useState<{
    edad: number | "";
    genero: "masculino" | "femenino";
    peso_actual_kg: number | "";
    altura_cm: number | "";
    nivel_actividad: "sedentario" | "ligero" | "moderado" | "intenso";
    peso_meta_kg: number | "";
  }>(() => ({
    edad: perfilUsuario?.edad ?? "",
    genero: perfilUsuario?.genero ?? "masculino",
    peso_actual_kg: perfilUsuario?.peso_actual_kg ?? "",
    altura_cm: perfilUsuario?.altura_cm ?? "",
    nivel_actividad: perfilUsuario?.nivel_actividad ?? "sedentario",
    peso_meta_kg: perfilUsuario?.peso_meta_kg ?? "",
  }));

  const [prevPerfil, setPrevPerfil] = useState(perfilUsuario);
  if (perfilUsuario !== prevPerfil) {
    setPrevPerfil(perfilUsuario);
    if (perfilUsuario) {
      setFormData({
        edad: perfilUsuario.edad ?? "",
        genero: perfilUsuario.genero ?? "masculino",
        peso_actual_kg: perfilUsuario.peso_actual_kg ?? "",
        altura_cm: perfilUsuario.altura_cm ?? "",
        nivel_actividad: perfilUsuario.nivel_actividad ?? "sedentario",
        peso_meta_kg: perfilUsuario.peso_meta_kg ?? "",
      });
    }
  }

  const [showTimelineSheet, setShowTimelineSheet] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdaptiveModal, setShowAdaptiveModal] = useState(false);

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.edad === "" ||
      formData.peso_actual_kg === "" ||
      formData.altura_cm === "" ||
      formData.peso_meta_kg === ""
    ) {
      return;
    }
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    onCalculateTargets({
      edad: Number(formData.edad),
      genero: formData.genero,
      peso_actual_kg: Number(formData.peso_actual_kg),
      altura_cm: Number(formData.altura_cm),
      nivel_actividad: formData.nivel_actividad,
      peso_meta_kg: Number(formData.peso_meta_kg),
    });
  };

  const {
    calorias_diarias_recomendadas = 0,
    rango_calorico,
    macros_objetivo,
    curva_progreso,
    tasa_metabolica_basal_bmr = 0,
    gasto_energetico_total_tdee = 0,
  } = metasData || {};

  const hasUserFormFilled =
    formData.edad !== "" && formData.peso_actual_kg !== "" && formData.altura_cm !== "";
  const hasCalculated = calorias_diarias_recomendadas > 0 && hasUserFormFilled;

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
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-fitia-surface text-stone-700 text-[10px] font-bold border border-stone-200">
              Harris-Benedict
            </span>
            {hasCalculated && onResetTargets && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    edad: "",
                    genero: "masculino",
                    peso_actual_kg: "",
                    altura_cm: "",
                    nivel_actividad: "sedentario",
                    peso_meta_kg: "",
                  });
                  onResetTargets();
                }}
                className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-500 text-[10px] font-bold border border-stone-200 transition active:scale-95"
                title="Limpiar datos y empezar de cero"
              >
                Limpiar ✕
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Edad</label>
              <input
                type="number"
                required
                placeholder="Ej. 35"
                value={formData.edad === "" ? "" : formData.edad}
                onChange={(e) => handleChange("edad", e.target.value === "" ? "" : Number(e.target.value))}
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
                step="0.1"
                required
                placeholder="Ej. 75.0"
                value={formData.peso_actual_kg === "" ? "" : formData.peso_actual_kg}
                onChange={(e) => handleChange("peso_actual_kg", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full h-11 min-h-[44px] rounded-xl border border-stone-300 px-3 text-xs font-semibold text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Altura (cm)</label>
              <input
                type="number"
                required
                placeholder="Ej. 175"
                value={formData.altura_cm === "" ? "" : formData.altura_cm}
                onChange={(e) => handleChange("altura_cm", e.target.value === "" ? "" : Number(e.target.value))}
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
                <option value="sedentario">Sedentario (Poco o nada)</option>
                <option value="ligero">Ligero (1-3 días/sem)</option>
                <option value="moderado">Moderado (3-5 días/sem)</option>
                <option value="intenso">Intenso (6-7 días/sem)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Peso Meta (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Ej. 68.0"
                value={formData.peso_meta_kg === "" ? "" : formData.peso_meta_kg}
                onChange={(e) => handleChange("peso_meta_kg", e.target.value === "" ? "" : Number(e.target.value))}
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

      {!hasCalculated ? (
        <div className="bg-white rounded-4xl border border-dashed border-stone-300 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-fitia-yellow/30 text-fitia-dark flex items-center justify-center mx-auto">
            <Activity className="w-6 h-6 text-fitia-dark" />
          </div>
          <div>
            <h4 className="text-sm font-black text-fitia-dark">Tu Plan Nutricional está en Blanco</h4>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Completa tus datos antropométricos arriba y haz clic en <strong>Calcular Presupuesto & Curva</strong> para obtener tu presupuesto calórico, macros y curva de proyección.
            </p>
          </div>
        </div>
      ) : (
        <>
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
        currentWeight={Number(formData.peso_actual_kg) || points[0]?.peso_proyectado_kg || 70}
        targetWeight={Number(formData.peso_meta_kg) || points[points.length - 1]?.peso_proyectado_kg || 65}
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
        </>
      )}

      {/* Timeline Milestones Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showTimelineSheet}
        onClose={() => setShowTimelineSheet(false)}
        title="Hitos Semanales de Progreso"
        subtitle={formData.peso_meta_kg ? `Proyección hacia meta de ${formData.peso_meta_kg} kg` : "Proyección hacia peso meta"}
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
        userData={{
          edad: Number(formData.edad) || 30,
          genero: formData.genero,
          peso_actual_kg: Number(formData.peso_actual_kg) || 70,
          altura_cm: Number(formData.altura_cm) || 170,
          nivel_actividad: formData.nivel_actividad,
          peso_meta_kg: Number(formData.peso_meta_kg) || 65,
        }}
        metasData={metasData}
      />

      {/* Modal de Presupuesto Adaptativo Semanal */}
      <AdaptiveBudgetModal
        isOpen={showAdaptiveModal}
        onClose={() => setShowAdaptiveModal(false)}
        userData={{
          edad: Number(formData.edad) || 30,
          genero: formData.genero,
          peso_actual_kg: Number(formData.peso_actual_kg) || 70,
          altura_cm: Number(formData.altura_cm) || 170,
          nivel_actividad: formData.nivel_actividad,
          peso_meta_kg: Number(formData.peso_meta_kg) || 65,
        }}
        currentBudget={calorias_diarias_recomendadas}
        onApplyNewBudget={(_newBudget, _newTdee) => {
          onCalculateTargets({
            edad: Number(formData.edad) || 30,
            genero: formData.genero,
            peso_actual_kg: Number(formData.peso_actual_kg) || 70,
            altura_cm: Number(formData.altura_cm) || 170,
            nivel_actividad: formData.nivel_actividad,
            peso_meta_kg: Number(formData.peso_meta_kg) || 65,
          });
        }}
      />
    </div>
  );
};
