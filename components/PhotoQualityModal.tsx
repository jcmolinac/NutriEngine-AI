// components/PhotoQualityModal.tsx
"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { FitiaButton } from "./FitiaButton";

interface PhotoQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function PhotoQualityModal({
  isOpen,
  onClose,
  onContinue,
}: PhotoQualityModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-quality-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-2xl border border-neutral-100 flex flex-col gap-4 text-center select-none animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="space-y-1">
          <div className="mx-auto w-10 h-10 rounded-full bg-fitia-yellow/20 flex items-center justify-center text-fitia-dark">
            <Sparkles className="w-5 h-5 text-fitia-dark" />
          </div>
          <h3 id="photo-quality-title" className="text-base font-black text-fitia-dark">
            Para una estimación precisa
          </h3>
          <p className="text-xs text-neutral-500 leading-snug">
            Enfoca tu plato completo desde arriba o a 45° para que la IA identifique cada porción.
          </p>
        </div>

        {/* Comparativa Visual de Calidad Fotográfica (Dos columnas) */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* Foto Correcta */}
          <div className="rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/40 p-2 space-y-1.5 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80"
                alt="Foto Correcta: plato completo visible"
                fill
                className="object-cover"
                unoptimized
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1.5 left-1.5 rounded-full bg-emerald-500 text-white p-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <span>Correcto</span>
              </p>
              <p className="text-[10px] text-neutral-600 leading-tight">
                Plato entero visible con ingredientes y bordes claros.
              </p>
            </div>
          </div>

          {/* Foto Incorrecta */}
          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/40 p-2 space-y-1.5 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80"
                alt="Foto Incorrecta: zoom excesivo"
                fill
                className="object-cover scale-150"
                unoptimized
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1.5 left-1.5 rounded-full bg-rose-500 text-white p-0.5">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                <span>Incorrecto</span>
              </p>
              <p className="text-[10px] text-neutral-600 leading-tight">
                Demasiado cerca, ingredientes ocultos o cortados.
              </p>
            </div>
          </div>
        </div>

        {/* Tip adicional */}
        <div className="rounded-xl bg-fitia-cream p-2.5 text-[11px] text-neutral-600 font-medium border border-neutral-100 text-center">
          💡 La IA calibrará automáticamente el peso según el tamaño estándar del plato.
        </div>

        {/* Botón de Acción Fitia */}
        <div className="space-y-2 pt-1">
          <FitiaButton
            id="btn-confirm-photo-quality"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(25);
              }
              onContinue();
            }}
          >
            Entendido, abrir cámara
          </FitiaButton>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
