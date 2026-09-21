"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Send,
  Plus,
  AlertCircle,
  ScanBarcode,
  Trash2,
} from "lucide-react";
import { RegistroDiario, MetasYProgreso, RegistroAgua } from "@/types/nutrition";
import { CalorieGauge } from "./CalorieGauge";
import { CalendarDateStrip } from "./CalendarDateStrip";
import { WaterTrackerCard } from "./WaterTrackerCard";
import { FastingTimerWidget } from "./FastingTimerWidget";
import { BarcodeScannerModal } from "./BarcodeScannerModal";

interface LogDiaryTabProps {
  registroData: RegistroDiario;
  metasData?: MetasYProgreso;
  registroAgua?: RegistroAgua;
  onAddWater?: (ml: number) => void;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  dayRecords?: Record<string, { calorias: number; objetivoCalorias: number }>;
  onAddDirectItem?: (item: any, mealTime: "Desayuno" | "Comida" | "Cena" | "Snack") => void;
  onDeleteDirectItem?: (sectionId: "desayuno" | "comida" | "cena", index: number, item: any) => void;
  onLogTextOrVoice: (params: { text?: string; audioBase64?: string; audioMimeType?: string }) => Promise<void>;
  isProcessing: boolean;
}

interface MealSection {
  id: "desayuno" | "comida" | "cena";
  title: string;
  defaultTime: string;
  recommendedKcal: number;
  items: Array<{
    nombre: string;
    peso_g: number;
    calorias: number;
    proteinas_g: number;
    carbohidratos_g: number;
    grasas_g: number;
    fibra_g?: number;
    sodio_mg?: number;
  }>;
}

export const LogDiaryTab: React.FC<LogDiaryTabProps> = ({
  registroData,
  metasData,
  registroAgua,
  onAddWater,
  selectedDate,
  onSelectDate,
  dayRecords,
  onAddDirectItem,
  onDeleteDirectItem,
  onLogTextOrVoice,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState(
    registroData.descripcion_original || ""
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [localWater, setLocalWater] = useState(registroAgua?.consumido_ml || 0);
  const [currentDate, setCurrentDate] = useState(
    selectedDate || new Date().toISOString().split("T")[0]
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [manualAddedMeals, setManualAddedMeals] = useState<Record<string, Array<{
    nombre: string;
    peso_g: number;
    calorias: number;
    proteinas_g: number;
    carbohidratos_g: number;
    grasas_g: number;
    fibra_g?: number;
    sodio_mg?: number;
  }>>>({});

  const targetKcal = metasData?.calorias_diarias_recomendadas || 2000;

  // Secciones limpias sin datos de prueba precargados
  const mealSections = React.useMemo<MealSection[]>(() => {
    const baseSections: MealSection[] = [
      {
        id: "desayuno",
        title: "Desayuno",
        defaultTime: "08:30",
        recommendedKcal: Math.round(targetKcal * 0.25),
        items: [],
      },
      {
        id: "comida",
        title: "Comida",
        defaultTime: "14:00",
        recommendedKcal: Math.round(targetKcal * 0.45),
        items: [],
      },
      {
        id: "cena",
        title: "Cena",
        defaultTime: "21:00",
        recommendedKcal: Math.round(targetKcal * 0.3),
        items: [],
      },
    ];

    if (registroData?.items_reconocidos && registroData.items_reconocidos.length > 0) {
      const assignedTarget = (registroData.tiempo_comida || "almuerzo").toLowerCase();
      const targetId: "desayuno" | "comida" | "cena" =
        assignedTarget.includes("desayun")
          ? "desayuno"
          : assignedTarget.includes("cen")
          ? "cena"
          : "comida";

      const mapped = registroData.items_reconocidos.map((it) => ({
        nombre: it.alimento,
        peso_g: it.peso_g || 100,
        calorias: it.calorias || 150,
        proteinas_g: it.proteinas_g || 10,
        carbohidratos_g: it.carbohidratos_g || 15,
        grasas_g: it.grasas_g || 5,
        fibra_g: it.fibra_g || 0,
        sodio_mg: it.sodio_mg || 0,
      }));

      return baseSections.map((sec) => {
        const extra = manualAddedMeals[sec.id] || [];
        if (sec.id === targetId) {
          return { ...sec, items: [...mapped, ...extra] };
        }
        return { ...sec, items: [...sec.items, ...extra] };
      });
    }

    return baseSections.map((sec) => ({
      ...sec,
      items: [...sec.items, ...(manualAddedMeals[sec.id] || [])],
    }));
  }, [registroData, manualAddedMeals, targetKcal]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setMicError(null);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(35);
      }
      audioChunksRef.current = [];

      // Detección de códecs de audio compatibles (Safari iOS requiere mp4/aac, Chrome/Firefox webm)
      let selectedMimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          selectedMimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          selectedMimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          selectedMimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          selectedMimeType = "audio/aac";
        } else {
          selectedMimeType = "";
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const actualMime = selectedMimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        stream.getTracks().forEach((track) => track.stop());

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onLogTextOrVoice({
            audioBase64: base64,
            audioMimeType: actualMime,
            text: "Nota de voz grabada por el usuario",
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("Fallo al acceder al micrófono:", err);
      setMicError("Permiso de micrófono no otorgado o no disponible en este dispositivo.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(25);
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    const textToSubmit = inputText;
    setInputText("");
    onLogTextOrVoice({ text: textToSubmit });
  };

  const handleDeleteMealItem = (
    sectionId: "desayuno" | "comida" | "cena",
    itemIndex: number,
    item: any
  ) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setManualAddedMeals((prev) => {
      const currentList = prev[sectionId] || [];
      const updated = currentList.filter((_, idx) => idx !== itemIndex);
      return { ...prev, [sectionId]: updated };
    });
    onDeleteDirectItem?.(sectionId, itemIndex, item);
  };

  // Cálculo global de calorías y macros del día
  const totalKcal = mealSections.reduce(
    (acc, sec) => acc + sec.items.reduce((sAcc, it) => sAcc + it.calorias, 0),
    0
  );
  const totalProteinas = mealSections.reduce(
    (acc, sec) => acc + sec.items.reduce((sAcc, it) => sAcc + it.proteinas_g, 0),
    0
  );
  const totalCarbs = mealSections.reduce(
    (acc, sec) => acc + sec.items.reduce((sAcc, it) => sAcc + it.carbohidratos_g, 0),
    0
  );
  const totalGrasas = mealSections.reduce(
    (acc, sec) => acc + sec.items.reduce((sAcc, it) => sAcc + it.grasas_g, 0),
    0
  );
  const totalFibra = mealSections.reduce(
    (acc, sec) => acc + sec.items.reduce((sAcc, it: any) => sAcc + (it.fibra_g || 0), 0),
    0
  );
  const totalSodio = mealSections.reduce(
    (acc, sec) => acc + sec.items.reduce((sAcc, it: any) => sAcc + (it.sodio_mg || 0), 0),
    0
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2 select-none">
      {/* 1. Selector de Calendario y Racha de Días */}
      <CalendarDateStrip
        selectedDate={currentDate}
        onSelectDate={(d) => {
          setCurrentDate(d);
          onSelectDate?.(d);
        }}
        dayRecords={dayRecords}
      />

      {/* 2. Medidor de Calorías en Arco SVG (Gauge) del Día */}
      <CalorieGauge
        currentKcal={totalKcal}
        minKcal={metasData?.rango_calorico?.min || targetKcal - 100}
        maxKcal={metasData?.rango_calorico?.max || targetKcal + 100}
        proteinGrams={Math.round(totalProteinas)}
        carbsGrams={Math.round(totalCarbs)}
        fatGrams={Math.round(totalGrasas)}
      />

      {/* 3. Desglose de Micronutrientes Críticos (Fibra y Sodio) */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Fibra Dietética</span>
          <p className="text-sm font-black text-emerald-950 font-mono">
            {totalFibra.toFixed(1)} <span className="text-xs font-normal text-emerald-700">/ 35 g</span>
          </p>
          <span className="text-[9px] text-emerald-600 font-medium">Saciedad y salud intestinal</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Sodio Estimado</span>
          <p className="text-sm font-black text-amber-950 font-mono">
            {Math.round(totalSodio)} <span className="text-xs font-normal text-amber-700">/ 2,300 mg</span>
          </p>
          <span className="text-[9px] text-amber-600 font-medium">Control de retención de líquidos</span>
        </div>
      </div>

      {/* Hero de Entrada Rápida por Voz y Texto */}
      <div className="bg-fitia-cream rounded-4xl border border-neutral-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-fitia-green tracking-wider uppercase">
              Registro Rápido IA
            </span>
            <h3 className="text-base font-black text-fitia-dark leading-tight">
              Cuéntale a Fitia lo que comiste
            </h3>
          </div>
          {isRecording && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          )}
        </div>

        {micError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{micError}</span>
            </div>
            <button
              type="button"
              onClick={() => setMicError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Selector de Entrada Rápida: Voz o Código de Barras */}
        <div className="flex items-center justify-center gap-6 py-2">
          {/* Botón de Voz */}
          <div className="flex flex-col items-center">
            {!isRecording ? (
              <button
                id="btn-voice-record-start"
                type="button"
                onClick={startRecording}
                disabled={isProcessing}
                aria-label="Iniciar grabación por voz"
                className="w-16 h-16 min-h-[44px] min-w-[44px] rounded-full bg-fitia-yellow text-fitia-dark flex items-center justify-center shadow-md active:scale-95 transition"
              >
                <Mic className="w-7 h-7 text-fitia-dark" />
              </button>
            ) : (
              <button
                id="btn-voice-record-stop"
                type="button"
                onClick={stopRecording}
                aria-label="Detener grabación"
                className="w-16 h-16 min-h-[44px] min-w-[44px] rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95 animate-bounce transition"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            )}
            <span className="text-[10px] font-bold text-stone-600 mt-1.5">
              {isRecording ? "Detener" : "Dictar Voz"}
            </span>
          </div>

          {/* Botón de Código de Barras */}
          <div className="flex flex-col items-center">
            <button
              id="btn-open-barcode-modal"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate?.(20);
                }
                setShowBarcodeModal(true);
              }}
              disabled={isProcessing}
              aria-label="Escanear código de barras"
              className="w-16 h-16 min-h-[44px] min-w-[44px] rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex items-center justify-center shadow-md active:scale-95 transition"
            >
              <ScanBarcode className="w-7 h-7 text-stone-900" />
            </button>
            <span className="text-[10px] font-bold text-stone-600 mt-1.5">
              Código Barras
            </span>
          </div>
        </div>

        {/* Input de texto manual alternativo */}
        <form onSubmit={handleSubmitText} className="space-y-2">
          <div className="relative">
            <textarea
              id="input-diary-text"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej: 2 huevos revueltos con tostada y café..."
              className="w-full rounded-2xl border border-neutral-200 bg-white p-3 text-xs font-medium text-neutral-900 focus:border-fitia-yellow focus:outline-none"
            />
          </div>

          <button
            type="submit"
            id="btn-submit-diary-text"
            disabled={isProcessing || !inputText.trim()}
            className="w-full h-11 min-h-[44px] rounded-full bg-fitia-yellow hover:bg-[#F5BF00] active:scale-98 text-fitia-dark text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-fitia-dark" />
            <span>{isProcessing ? "Interpretando alimentos..." : "Registrar Alimentos"}</span>
          </button>
        </form>
      </div>

      {/* MICROCOPY EMPÁTICO DE FITIA */}
      <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-center">
        <p className="text-xs font-medium text-amber-950 leading-relaxed">
          &ldquo;No te preocupes si no recuerdas todos los alimentos o pesos exactos, una estimación sirve para mantener tu hábito.&rdquo;
        </p>
      </div>

      {/* TARJETAS LIMPIAS E INDEPENDIENTES PARA DESAYUNO, COMIDA Y CENA CON BOTÓN EN PÍLDORA GRIS CLARO Y "+" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
            Comidas del Día
          </h4>
          <span className="text-[11px] font-semibold text-neutral-400">
            {totalKcal} kcal consumidas
          </span>
        </div>

        {mealSections.map((section) => {
          const sectionKcal = section.items.reduce((acc, it) => acc + it.calorias, 0);

          return (
            <div
              key={section.id}
              className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm space-y-3"
            >
              {/* Encabezado de la tarjeta con Botón en píldora gris claro y el icono "+" */}
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-black text-fitia-dark">{section.title}</h5>
                  <span className="text-[11px] font-medium text-neutral-400">
                    Sugerido: ~{section.recommendedKcal} kcal
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-sm font-black text-neutral-900 font-mono">
                      {sectionKcal}
                    </span>{" "}
                    <span className="text-[10px] font-bold text-neutral-400">kcal</span>
                  </div>

                  {/* Botón en píldora gris claro con el icono "+" */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "vibrate" in navigator) {
                        navigator.vibrate?.(20);
                      }
                      setInputText(`Agregué a mi ${section.title.toLowerCase()}: `);
                      const inputEl = document.getElementById("input-diary-text");
                      if (inputEl) {
                        inputEl.focus();
                        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    aria-label={`Añadir alimento a ${section.title}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 text-xs font-bold transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Lista de alimentos registrados en esta comida */}
              {section.items.length > 0 ? (
                <div className="space-y-1.5 pt-1 border-t border-neutral-50">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 text-xs text-neutral-700 border-b border-neutral-50 last:border-0"
                    >
                      <div className="truncate pr-2 flex-1">
                        <p className="font-semibold text-neutral-900 truncate">{item.nombre}</p>
                        <p className="text-[10px] text-neutral-400">
                          {item.peso_g} g • P: {item.proteinas_g}g | C: {item.carbohidratos_g}g | G:{" "}
                          {item.grasas_g}g
                          {item.fibra_g ? ` | Fibra: ${item.fibra_g}g` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-neutral-900 font-mono">
                          {item.calorias} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMealItem(section.id, idx, item)}
                          aria-label={`Eliminar ${item.nombre}`}
                          title={`Eliminar ${item.nombre}`}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-stone-300 hover:text-rose-600 flex items-center justify-center transition active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 italic text-center py-1">
                  Sin alimentos registrados aún. Toca + para añadir.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Rastreador de Hidratación (Agua) */}
      <WaterTrackerCard
        consumidoMl={registroAgua?.consumido_ml ?? localWater}
        metaMl={registroAgua?.meta_ml || 3300}
        onAddWater={(ml) => {
          setLocalWater((prev) => Math.max(0, prev + ml));
          onAddWater?.(ml);
        }}
      />

      {/* 5. Temporizador de Ayuno Intermitente 16:8 */}
      <FastingTimerWidget />

      {/* Modal de Escáner de Código de Barras */}
      <BarcodeScannerModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        onAddMeal={(item, time) => {
          const secId =
            time === "Desayuno"
              ? "desayuno"
              : time === "Cena"
              ? "cena"
              : "comida";
          setManualAddedMeals((prev) => ({
            ...prev,
            [secId]: [...(prev[secId] || []), item],
          }));
          onAddDirectItem?.(item, time);
        }}
      />
    </div>
  );
};
