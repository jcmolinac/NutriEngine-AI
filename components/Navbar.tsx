"use client";

import React from "react";
import {
  Camera,
  Mic,
  User as UserIcon,
  CalendarDays,
  Activity,
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
    id: "LOG_DIARY_TEXT_OR_VOICE",
    label: "Diario",
    mobileLabel: "Diario",
    icon: <Mic className="w-3.5 h-3.5" />,
  },
  {
    id: "MEAL_PLANNER",
    label: "Plan",
    mobileLabel: "Plan",
    icon: <CalendarDays className="w-3.5 h-3.5" />,
  },
  {
    id: "SCAN_FOOD",
    label: "Cámara",
    mobileLabel: "Cámara",
    icon: <Camera className="w-3.5 h-3.5" />,
  },
  {
    id: "CALCULATE_TARGETS_AND_TIMELINE",
    label: "Perfil",
    mobileLabel: "Perfil",
    icon: <UserIcon className="w-3.5 h-3.5" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs select-none pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="w-full px-3.5 pb-2.5">
        <div className="flex items-center justify-between h-10">
          {/* Mobile Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-fitia-yellow flex items-center justify-center text-fitia-dark shadow-2xs font-black">
              <Activity className="w-4 h-4 text-fitia-dark stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-fitia-dark tracking-tight text-sm leading-none">
                NutriEngine
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-fitia-yellow text-fitia-dark uppercase tracking-wider">
                Fitia
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>
          </div>

          {/* Top Action Tools (User Auth & Session) */}
          <div className="flex items-center gap-1.5">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-user-profile-pill"
                  onClick={onOpenAuthModal}
                  className="h-8 px-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[85px] truncate">
                    {currentUser.nombre || currentUser.email.split("@")[0]}
                  </span>
                </button>
                <button
                  id="btn-logout-user"
                  type="button"
                  onClick={onLogout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="h-8 w-8 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 flex items-center justify-center transition active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-auth-modal"
                type="button"
                onClick={onOpenAuthModal}
                className="h-8 px-3 rounded-xl bg-fitia-yellow hover:bg-[#F5BF00] text-fitia-dark text-[11px] font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <UserIcon className="w-3 h-3 text-fitia-dark" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Segmented Control 100% Native: 4 columnas exactas sin desbordamiento ni scroll */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100/90 rounded-2xl mt-1.5 border border-stone-200/70">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`chip-tab-${tab.id.toLowerCase()}`}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all ${
                  isActive
                    ? "bg-white text-fitia-dark shadow-xs font-black ring-1 ring-stone-200/80"
                    : "text-stone-500 hover:text-stone-900 active:bg-stone-200/50"
                }`}
              >
                <span className={isActive ? "text-amber-600" : "text-stone-400"}>
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
