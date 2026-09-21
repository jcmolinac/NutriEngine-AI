"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  Send,
  Coffee,
  HeartPulse,
  Sun,
  Moon,
} from "lucide-react";
import { ModuloCoach } from "@/types/nutrition";

interface CoachAdviceTabProps {
  coachData: ModuloCoach;
  onAskCoach: (query: string) => Promise<void>;
  isProcessing: boolean;
}

const FREQUENT_QUESTIONS = [
  "¿Cómo estructurar un protocolo 16/8 sin perder masa muscular?",
  "¿Cuánta proteína por kilo necesito en déficit calórico?",
  "¿Rompe el ayuno el café solo o el agua con sal?",
];

export const CoachAdviceTab: React.FC<CoachAdviceTabProps> = ({
  coachData,
  onAskCoach,
  isProcessing,
}) => {
  const [queryText, setQueryText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    onAskCoach(queryText.trim());
  };

  const { respuesta_consulta, sugerencia_ayuno } = coachData;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2">
      {/* Fasting Protocol Card */}
      {sugerencia_ayuno && (
        <div className="bg-fitia-cream rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-fitia-yellow text-fitia-dark flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-fitia-dark" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider block">
                  Crononutrición
                </span>
                <h4 className="text-sm font-black text-fitia-dark">
                  {sugerencia_ayuno.protocolo || "Protocolo 16/8"}
                </h4>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-fitia-surface border border-stone-200 text-stone-700 text-[10px] font-bold">
              Evidencia A
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-white border border-stone-200/80">
              <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Ventana Ingesta
              </span>
              <p className="font-mono font-bold text-fitia-dark mt-1">
                {sugerencia_ayuno.ventana_ingesta || "12:00 - 20:00"}
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-stone-200/80">
              <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                Protocolo
              </span>
              <p className="font-mono font-bold text-fitia-dark mt-1">
                {sugerencia_ayuno.protocolo || "16/8"}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-600 bg-white p-3 rounded-2xl border border-stone-100 leading-relaxed">
            {sugerencia_ayuno.recomendacion ||
              "Permitido agua, café solo y té sin calorías durante la fase de ayuno."}
          </p>
        </div>
      )}

      {/* Query Form Card */}
      <div className="bg-white rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-fitia-dark">
          <Sparkles className="w-4 h-4 text-fitia-green" />
          <h3 className="text-sm font-black uppercase tracking-wider">
            Consultar al Coach IA
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <textarea
            rows={2}
            id="input-coach-query"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Pregunta sobre saciedad, macros, digestión o suplementos..."
            className="w-full text-xs rounded-2xl border border-stone-300 p-3 focus:outline-none focus:ring-2 focus:ring-fitia-yellow/30 focus:border-fitia-yellow text-stone-800 bg-fitia-surface resize-none"
          />

          <button
            type="submit"
            id="btn-submit-coach-query"
            disabled={isProcessing || !queryText.trim()}
            className="w-full h-12 min-h-[44px] rounded-2xl bg-fitia-yellow hover:bg-[#F5BF00] active:scale-98 text-fitia-dark text-xs font-black flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Send className={`w-4 h-4 text-fitia-dark ${isProcessing ? "animate-spin" : ""}`} />
            <span>{isProcessing ? "Consultando al Coach..." : "Enviar Consulta"}</span>
          </button>
        </form>

        {/* Quick FAQ Chips */}
        <div className="pt-2 border-t border-stone-100">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
            Preguntas Rápidas:
          </span>
          <div className="space-y-1.5">
            {FREQUENT_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                id={`btn-faq-${idx}`}
                onClick={() => {
                  if (typeof window !== "undefined" && "vibrate" in navigator) {
                    navigator.vibrate?.(20);
                  }
                  setQueryText(q);
                  onAskCoach(q);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-fitia-surface hover:bg-stone-200 active:bg-fitia-yellow/20 text-xs font-medium text-stone-700 min-h-[44px] flex items-center transition border border-stone-200/60"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coach Response Card */}
      {respuesta_consulta && (
        <div className="p-4 rounded-4xl bg-fitia-cream border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-fitia-dark flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-fitia-green" />
              Respuesta Clínica
            </span>
            <span className="text-[10px] font-mono text-fitia-green font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200">
              Basado en Evidencia
            </span>
          </div>
          <p className="text-xs text-stone-800 leading-relaxed font-medium">
            {respuesta_consulta}
          </p>
        </div>
      )}
    </div>
  );
};
