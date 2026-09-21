// components/WeightCurveChart.tsx
"use client";

import React from "react";

interface WeightCurveProps {
  currentWeight: number;
  targetWeight: number;
  targetDate: string;
}

export function WeightCurveChart({
  currentWeight,
  targetWeight,
  targetDate,
}: WeightCurveProps) {
  const isLoss = targetWeight < currentWeight;
  const isGain = targetWeight > currentWeight;
  const isMaintenance = targetWeight === currentWeight;

  const diffKg = Math.abs(currentWeight - targetWeight).toFixed(1);

  // Coordenadas calculadas dinámicamente según objetivo (pérdida vs ganancia)
  const startX = 25;
  const endX = 220;
  const projX = 285;

  // En SVG: Y menor = más arriba (mayor peso en pérdida), Y mayor = más abajo
  const startY = isLoss ? 28 : isGain ? 78 : 50;
  const targetY = isLoss ? 78 : isGain ? 28 : 50;

  // Control points para curva Bézier suave y realista
  const ctrlX = Math.round((startX + endX) * 0.48);
  const ctrlY = isLoss
    ? Math.round(startY + (targetY - startY) * 0.35)
    : isGain
    ? Math.round(startY + (targetY - startY) * 0.35)
    : startY;

  const curvePath = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${targetY}`;
  const areaPath = `${curvePath} L ${endX} 115 L ${startX} 115 Z`;

  return (
    <div className="w-full rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isLoss ? "bg-emerald-500" : isGain ? "bg-amber-500" : "bg-blue-500"}`} />
          {isLoss ? "Fase de Definición" : isGain ? "Fase de Volumen" : "Mantenimiento"}
        </span>
        <span className="text-[11px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-lg">
          {isMaintenance ? "Estable" : `${isLoss ? "-" : "+"}${diffKg} kg`}
        </span>
      </div>

      <div className="relative mt-2 h-44 w-full">
        {/* Badge Peso Inicial Dinámico */}
        <div
          style={{ left: `${startX}px`, top: `${Math.max(0, startY - 26)}px` }}
          className="absolute z-10 -translate-x-1/4 rounded-lg bg-neutral-900 px-2 py-0.5 text-[11px] font-black text-white shadow-xs font-mono whitespace-nowrap"
        >
          {currentWeight} kg
        </div>

        {/* Badge Peso Meta con Trofeo */}
        <div
          style={{ left: `${endX}px`, top: `${Math.max(0, targetY - 28)}px` }}
          className="absolute z-10 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-fitia-yellow px-2 py-0.5 text-[11px] font-black text-fitia-dark shadow-xs font-mono whitespace-nowrap"
        >
          <span>🏆</span>
          <span>{targetWeight} kg</span>
        </div>

        {/* Curva SVG Dinámica con degradado */}
        <svg viewBox="0 0 300 120" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="curveFillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC800" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#FFC800" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Área sombreada */}
          <path d={areaPath} fill="url(#curveFillGradient)" />

          {/* Línea guía de base */}
          <line x1={startX} y1="115" x2={projX} y2="115" stroke="#F1F5F9" strokeWidth="1" />

          {/* Línea principal curva calculada */}
          <path
            d={curvePath}
            fill="none"
            stroke="#FFC800"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Puntos de referencia inicial y objetivo */}
          <circle cx={startX} cy={startY} r="5" fill="#1C1917" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx={endX} cy={targetY} r="5.5" fill="#FFC800" stroke="#1C1917" strokeWidth="2" />

          {/* Líneas discontinuas proyectadas hacia adelante */}
          <line
            x1={endX}
            y1={targetY}
            x2={projX}
            y2={isLoss ? targetY - 10 : targetY + 10}
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1={endX}
            y1={targetY}
            x2={projX}
            y2={targetY}
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1={endX}
            y1={targetY}
            x2={projX}
            y2={isLoss ? targetY + 10 : targetY - 10}
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Eje de fechas inferior */}
        <div className="mt-2 flex justify-between text-[11px] font-bold text-neutral-400">
          <span>Hoy</span>
          <span>Intermedio</span>
          <span className="text-fitia-dark font-black">{targetDate || "Meta Final"}</span>
        </div>
      </div>
    </div>
  );
}
