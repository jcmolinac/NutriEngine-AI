"use client";

import React from "react";
import {
  Camera,
  Mic,
  Target,
  CalendarDays,
  ShoppingCart,
  Sparkles,
  Activity,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { AccionEjecutada } from "@/types/nutrition";

interface NavbarProps {
  activeTab: AccionEjecutada;
  setActiveTab: (tab: AccionEjecutada) => void;
  showJsonDrawer?: boolean;
  setShowJsonDrawer?: (show: boolean) => void;
  isProcessing: boolean;
  onOpenLiveCamera: () => void;
  currentUser?: { id: string; email: string; nombre?: string } | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const TABS: Array<{
  id: AccionEjecutada;
  label: string;
  mobileLabel: string;
  icon: React.ReactNode;
}> = [
  {
    id: "CALCULATE_TARGETS_AND_TIMELINE",
    label: "1. Hoy & Metas",
    mobileLabel: "Hoy",
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: "LOG_DIARY_TEXT_OR_VOICE",
    label: "2. Registro Diario",
    mobileLabel: "Diario",
    icon: <Mic className="w-4 h-4" />,
  },
  {
    id: "SCAN_FOOD",
    label: "3. Escáner de Plato",
    mobileLabel: "Cámara",
    icon: <Camera className="w-4 h-4" />,
  },
  {
    id: "MEAL_PLANNER",
    label: "4. Plan Semanal",
    mobileLabel: "Plan",
    icon: <CalendarDays className="w-4 h-4" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  showJsonDrawer,
  setShowJsonDrawer,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const handleTabClick = (tabId: AccionEjecutada) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-2xs select-none pt-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="w-full px-3.5 pb-2">
        <div className="flex items-center justify-between h-11">
          {/* Mobile Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fitia-yellow flex items-center justify-center text-fitia-dark shadow-xs font-black">
              <Activity className="w-4 h-4 text-fitia-dark" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-fitia-dark tracking-tight text-base leading-none">
                  NutriEngine
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-fitia-yellow text-fitia-dark uppercase tracking-wider">
                  Fitia
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fitia-green animate-pulse" />
                <span>Mobile Engine</span>
              </div>
            </div>
          </div>

          {/* Top Action Tools (User Auth) */}
          <div className="flex items-center gap-1.5">
            {/* User Session Pill or Login Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-user-profile-pill"
                  onClick={onOpenAuthModal}
                  className="h-9 min-h-[44px] px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs max-w-[90px] truncate font-semibold">
                    {currentUser.nombre || currentUser.email.split("@")[0]}
                  </span>
                </button>
                <button
                  id="btn-logout-user"
                  type="button"
                  onClick={onLogout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 flex items-center justify-center transition active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-auth-modal"
                type="button"
                onClick={onOpenAuthModal}
                className="h-9 min-h-[44px] px-3.5 rounded-xl bg-fitia-yellow hover:bg-[#F5BF00] text-fitia-dark text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-fitia-dark" />
                <span className="text-xs">Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick horizontal category chip-bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`chip-tab-${tab.id.toLowerCase()}`}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 min-h-[32px] ${
                  isActive
                    ? "bg-fitia-dark text-white font-bold shadow-xs"
                    : "bg-neutral-100 text-neutral-600 active:bg-neutral-200 hover:text-neutral-900"
                }`}
              >
                <span className={isActive ? "text-fitia-yellow" : "text-neutral-500"}>
                  {tab.icon}
                </span>
                <span>{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
