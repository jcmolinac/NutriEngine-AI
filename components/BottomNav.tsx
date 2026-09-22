// components/BottomNav.tsx
"use client";

import React from "react";
import { AccionEjecutada } from "@/types/nutrition";

interface BottomNavProps {
  activeTab: AccionEjecutada;
  onTabChange: (tab: AccionEjecutada) => void;
  onOpenScanner: () => void;
}

export function BottomNav({ activeTab, onTabChange, onOpenScanner }: BottomNavProps) {
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(35);
    }
  };

  return (
    <nav
      aria-label="Barra de Navegación Móvil Fitia"
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-neutral-100 bg-white/95 backdrop-blur-md pb-[max(0.6rem,env(safe-area-inset-bottom))] select-none shadow-lg"
    >
      <div className="flex h-16 items-center justify-around px-1.5">
        {/* 1. Diario (Registro diario de comidas, hábitos, hidratación y ayuno) */}
        <button
          id="nav-tab-diary"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("LOG_DIARY_TEXT_OR_VOICE");
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "LOG_DIARY_TEXT_OR_VOICE"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={activeTab === "LOG_DIARY_TEXT_OR_VOICE" ? 2.5 : 2.0}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>Diario</span>
        </button>

        {/* 2. Plan (Planificador de Menús con Alimentos Seleccionados + Lista de Compras) */}
        <button
          id="nav-tab-plan"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("MEAL_PLANNER");
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "MEAL_PLANNER"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={activeTab === "MEAL_PLANNER" ? 2.5 : 2.0}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Plan</span>
        </button>

        {/* 3. BOTÓN CENTRAL ESCÁNER 100% CENTRADO (Disparador destacado en Amarillo Fitia) */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            id="nav-central-scanner-btn"
            type="button"
            onClick={() => {
              triggerHaptic();
              onOpenScanner();
            }}
            className="flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-fitia-yellow text-fitia-dark shadow-lg ring-4 ring-white active:scale-95 transition-transform"
            aria-label="Escanear plato con cámara"
          >
            <svg className="h-6 w-6 text-fitia-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.3}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.3}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <span className="text-[10px] font-black text-fitia-dark mt-1 leading-none">
            Escanear
          </span>
        </div>

        {/* 4. Progreso (Evolución de Peso Real, Balance Calórico y Racha de Hábitos) */}
        <button
          id="nav-tab-progress"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("PROGRESS_METRICS");
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "PROGRESS_METRICS"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={activeTab === "PROGRESS_METRICS" ? 2.5 : 2.0}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <span>Progreso</span>
        </button>

        {/* 5. Perfil (Información Personal, Datos Antropométricos, BMR/TDEE y Cuenta) */}
        <button
          id="nav-tab-profile"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("CALCULATE_TARGETS_AND_TIMELINE");
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "CALCULATE_TARGETS_AND_TIMELINE"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={activeTab === "CALCULATE_TARGETS_AND_TIMELINE" ? 2.5 : 2.0}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Perfil</span>
        </button>
      </div>
    </nav>
  );
}
