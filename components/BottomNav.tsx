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
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-neutral-100 bg-white/95 backdrop-blur-md pb-[max(0.6rem,env(safe-area-inset-bottom))] select-none"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {/* Hoy (Metas, BMR y Progreso Diario) */}
        <button
          id="nav-tab-today"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("CALCULATE_TARGETS_AND_TIMELINE");
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "CALCULATE_TARGETS_AND_TIMELINE"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Hoy</span>
        </button>

        {/* Diario (Registro de Comidas: Desayuno, Comida, Cena) */}
        <button
          id="nav-tab-diary"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("LOG_DIARY_TEXT_OR_VOICE");
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "LOG_DIARY_TEXT_OR_VOICE"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Diario</span>
        </button>

        {/* Botón Central Destacado en Amarillo Fitia (#FFC800) para Disparar Escáner */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <span className="text-[10px] font-black text-fitia-dark mt-1 leading-none">
            Escanear
          </span>
        </div>

        {/* Plan (Planificador de Comidas) */}
        <button
          id="nav-tab-plan"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("MEAL_PLANNER");
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "MEAL_PLANNER"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Plan</span>
        </button>

        {/* Perfil & Coach Nutricional */}
        <button
          id="nav-tab-coach"
          type="button"
          onClick={() => {
            triggerHaptic();
            onTabChange("COACH_ADVICE");
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === "COACH_ADVICE"
              ? "text-fitia-dark font-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Coach</span>
        </button>
      </div>
    </nav>
  );
}
