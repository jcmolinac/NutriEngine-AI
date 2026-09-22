"use client";

import React from "react";
import {
  User as UserIcon,
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

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs select-none pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="w-full px-4 py-2.5">
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
      </div>
    </header>
  );
};
