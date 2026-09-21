// components/CalorieGauge.tsx
"use client";

import React from "react";

interface CalorieGaugeProps {
  currentKcal: number;
  minKcal: number;
  maxKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export function CalorieGauge({
  currentKcal,
  minKcal,
  maxKcal,
  proteinGrams,
  carbsGrams,
  fatGrams,
}: CalorieGaugeProps) {
  // Calculamos el valor objetivo de referencia (midpoint del rango o maxKcal)
  const targetKcal = Math.max(1200, Math.round((minKcal + maxKcal) / 2) || maxKcal || 2000);
  const ceilingKcal = Math.max(targetKcal * 1.25, maxKcal * 1.15);

  // Proporción matemática normalizada entre 0.02 y 1
  const rawRatio = ceilingKcal > 0 ? currentKcal / ceilingKcal : 0;
  const t = Math.min(1, Math.max(0.02, rawRatio));

  // Cálculo exacto de curva cuadrática de Bézier para el arco: P0(15, 50) -> P1(100, 8) -> P2(185, 50)
  const p0x = 15;
  const p0y = 50;
  const p1x = 100;
  const p1y = 8;
  const p2x = 185;
  const p2y = 50;

  // Subdivisión de Bézier con algoritmo de De Casteljau en parámetro t
  const q1x = (1 - t) * p0x + t * p1x;
  const q1y = (1 - t) * p0y + t * p1y;
  const q2x = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
  const q2y = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

  const dynamicArcPath = `M ${p0x} ${p0y} Q ${q1x.toFixed(2)} ${q1y.toFixed(2)} ${q2x.toFixed(2)} ${q2y.toFixed(2)}`;

  // Estado calórico y colorimetría dinámica
  const isOverBudget = currentKcal > maxKcal;
  const isInTargetZone = currentKcal >= minKcal - 150 && currentKcal <= maxKcal + 50;
  const isUnderBudget = currentKcal < minKcal - 150;

  const strokeColor = isOverBudget
    ? "#EF4444" // Rojo / alerta de exceso
    : isInTargetZone
    ? "#22C55E" // Verde éxito Fitia
    : isUnderBudget && currentKcal > 0
    ? "#3B82F6" // Azul progreso activo
    : "#CBD5E1"; // Gris inicial

  const percentOfTarget = targetKcal > 0 ? Math.round((currentKcal / targetKcal) * 100) : 0;

  return (
    <div className="w-full rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
      {/* Arco de progreso SVG Dinámico */}
      <div className="relative flex flex-col items-center">
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 font-mono">
            {currentKcal.toLocaleString()}
          </h2>
          <span className="text-xs font-bold text-neutral-400">kcal</span>
          <span
            className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: isOverBudget ? "#FEE2E2" : isInTargetZone ? "#DCFCE7" : "#EFF6FF",
              color: isOverBudget ? "#B91C1C" : isInTargetZone ? "#15803D" : "#1D4ED8",
            }}
          >
            {percentOfTarget}% meta
          </span>
        </div>

        <div className="relative mt-2 h-16 w-64">
          <svg viewBox="0 0 200 60" className="w-full overflow-visible">
            {/* Pista base completa */}
            <path
              d={`M ${p0x} ${p0y} Q ${p1x} ${p1y} ${p2x} ${p2y}`}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Tramo completado dinámico calculado por Bézier */}
            <path
              d={dynamicArcPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />

            {/* Marcador indicador en el extremo actual del arco */}
            <circle
              cx={q2x}
              cy={q2y}
              r={isInTargetZone ? 8 : 6}
              fill={strokeColor}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="transition-all duration-300 ease-out shadow-sm"
            />

            {/* Si está en la zona objetivo ideal, mostramos tilde blanco en el indicador */}
            {isInTargetZone && (
              <path
                d={`M ${q2x - 3} ${q2y} L ${q2x - 0.5} ${q2y + 2.5} L ${q2x + 3.5} ${q2y - 2}`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Límites inferior y superior del presupuesto */}
          <div className="flex justify-between px-4 text-[11px] font-bold text-neutral-400 mt-1">
            <span>Min: {minKcal.toLocaleString()}</span>
            <span>Meta: {targetKcal.toLocaleString()}</span>
            <span>Max: {maxKcal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Macronutrientes en Gramos */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-2.5 border-t border-neutral-100 text-center">
        <div className="p-2 rounded-2xl bg-neutral-50/70">
          <p className="text-[11px] font-bold text-neutral-400">Proteínas</p>
          <p className="text-base font-black text-neutral-900 font-mono">{proteinGrams} g</p>
          <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-macro-protein" />
        </div>
        <div className="p-2 rounded-2xl bg-neutral-50/70">
          <p className="text-[11px] font-bold text-neutral-400">Carbos</p>
          <p className="text-base font-black text-neutral-900 font-mono">{carbsGrams} g</p>
          <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-macro-carbs" />
        </div>
        <div className="p-2 rounded-2xl bg-neutral-50/70">
          <p className="text-[11px] font-bold text-neutral-400">Grasas</p>
          <p className="text-base font-black text-neutral-900 font-mono">{fatGrams} g</p>
          <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-macro-fat" />
        </div>
      </div>
    </div>
  );
}
