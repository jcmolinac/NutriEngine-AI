"use client";

import React, { useState } from "react";
import { Download, Share2, PlusSquare, X, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { MobileBottomSheet } from "./MobileBottomSheet";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android flow
  if (isInstallable) {
    return (
      <button
        type="button"
        id="btn-install-pwa"
        onClick={() => {
          if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.(30);
          }
          install();
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          id="btn-install-pwa-ios"
          onClick={() => {
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(30);
            }
            setShowIOSGuide(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white text-xs font-semibold border border-stone-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instalar PWA</span>
        </button>

        <MobileBottomSheet
          isOpen={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
          title="Instalar en iPhone / iPad"
          subtitle="Accede en modo pantalla completa sin barra de navegación"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block text-sm">1. Toca Compartir</span>
                <span>Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <PlusSquare className="w-5 h-5" />
              </div>
              <div className="text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block text-sm">2. Agregar a Inicio</span>
                <span>Desplaza hacia abajo y selecciona <strong>&ldquo;Agregar a pantalla de inicio&rdquo;</strong>.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full h-12 min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition"
            >
              Entendido
            </button>
          </div>
        </MobileBottomSheet>
      </>
    );
  }

  return null;
};
