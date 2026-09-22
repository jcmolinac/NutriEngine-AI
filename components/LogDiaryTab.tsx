"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Mic,
  Square,
  Send,
  Plus,
  AlertCircle,
  ScanBarcode,
  Trash2,
  Pencil,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { RegistroDiario, MetasYProgreso, RegistroAgua } from "@/types/nutrition";
import { calibrarIngredienteConLaboratorio } from "@/lib/verified-nutrition-db";
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
  onUpdateDirectItem?: (sectionId: "desayuno" | "comida" | "cena", index: number, item: any) => void;
  onLogTextOrVoice: (params: { text?: string; audioBase64?: string; audioMimeType?: string }) => Promise<void>;
  isProcessing: boolean;
}

export interface DiaryItem {
  id: string;
  nombre: string;
  peso_g: number;
  calorias: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  fibra_g?: number;
  sodio_mg?: number;
  fuente_verificada?: {
    base_datos: string;
    codigo_referencia?: string;
    nombre_oficial?: string;
    similitud?: number;
  };
}

export interface MealSection {
  id: "desayuno" | "comida" | "cena";
  title: string;
  defaultTime: string;
  recommendedKcal: number;
  items: DiaryItem[];
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
  onUpdateDirectItem,
  onLogTextOrVoice,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState(registroData?.descripcion_original || "");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [localWater, setLocalWater] = useState(registroAgua?.consumido_ml || 0);

  // Fecha local estricta (siempre hoy por defecto)
  const formatLocalIso = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayIso = useMemo(() => formatLocalIso(new Date()), []);
  const [currentDate, setCurrentDate] = useState<string>(selectedDate || todayIso);

  // Selector de tiempo de comida objetivo (Desayuno, Comida, Cena)
  const getInitialMealTarget = (): "desayuno" | "comida" | "cena" => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "desayuno";
    if (hour >= 12 && hour < 18) return "comida";
    return "cena";
  };
  const [selectedMealTarget, setSelectedMealTarget] = useState<"desayuno" | "comida" | "cena">(
    getInitialMealTarget
  );

  // Estado unificado y editable para los alimentos del diario por sección
  const [mealsState, setMealsState] = useState<Record<string, DiaryItem[]>>({
    desayuno: [],
    comida: [],
    cena: [],
  });

  // Estado para el editor de gramos inline
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editingWeight, setEditingWeight] = useState<number>(100);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecRef = useRef<any>(null);

  const targetKcal = metasData?.calorias_diarias_recomendadas || 2000;

  // Sincronizar items que provienen del motor de IA (texto/voz/escaneo)
  useEffect(() => {
    if (registroData?.items_reconocidos && registroData.items_reconocidos.length > 0) {
      const assignedTarget = (
        registroData.tiempo_comida ||
        selectedMealTarget ||
        "comida"
      ).toLowerCase();
      const targetId: "desayuno" | "comida" | "cena" = assignedTarget.includes("desayun")
        ? "desayuno"
        : assignedTarget.includes("cen")
        ? "cena"
        : "comida";

      const newItems: DiaryItem[] = registroData.items_reconocidos.map((it, idx) => {
        let weight = Number(it.peso_g);
        if (!weight || isNaN(weight) || weight <= 0) {
          const match = (String(it.porcion_estimada || "") + " " + it.alimento).match(
            /(\d+)\s*(?:g|gramos)/i
          );
          weight = match ? Number(match[1]) : 120;
        }

        // Calibrar contra BEDCA / USDA
        const lab = calibrarIngredienteConLaboratorio(it.alimento, weight);
        if (lab) {
          return {
            id: it.id || `ing-${Date.now()}-${idx}`,
            nombre: it.alimento,
            peso_g: weight,
            calorias: lab.calorias,
            proteinas_g: lab.proteinas_g,
            carbohidratos_g: lab.carbohidratos_g,
            grasas_g: lab.grasas_g,
            fibra_g: lab.fibra_g,
            sodio_mg: lab.sodio_mg,
            fuente_verificada: {
              base_datos: lab.alimento_base.fuente,
              codigo_referencia: lab.alimento_base.codigo_referencia,
              nombre_oficial: lab.alimento_base.nombre_oficial,
              similitud: lab.similitud,
            },
          };
        }

        return {
          id: it.id || `ing-${Date.now()}-${idx}`,
          nombre: it.alimento,
          peso_g: weight,
          calorias: it.calorias || Math.round(weight * 1.5),
          proteinas_g: it.proteinas_g || 10,
          carbohidratos_g: it.carbohidratos_g || 15,
          grasas_g: it.grasas_g || 5,
          fibra_g: it.fibra_g || 0,
          sodio_mg: it.sodio_mg || 0,
          fuente_verificada: it.fuente_verificada,
        };
      });

      setMealsState((prev) => {
        const existing = prev[targetId] || [];
        // Filtrar duplicados exactos
        const unique = newItems.filter(
          (ni) =>
            !existing.some(
              (ex) => ex.nombre.toLowerCase() === ni.nombre.toLowerCase() && ex.calorias === ni.calorias
            )
        );
        return {
          ...prev,
          [targetId]: [...existing, ...unique],
        };
      });
    }
  }, [registroData]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Iniciar grabación con Web Speech API en tiempo real + MediaRecorder
  const startRecording = async () => {
    try {
      setMicError(null);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(35);
      }
      audioChunksRef.current = [];

      // 1. Iniciar SpeechRecognition si está disponible en el navegador (iOS Safari / Chrome / Android)
      const SpeechRec =
        typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = "es-ES";
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (evt: any) => {
            let transcript = "";
            for (let i = 0; i < evt.results.length; i++) {
              transcript += evt.results[i][0].transcript;
            }
            if (transcript.trim()) {
              setInputText(transcript.trim());
            }
          };
          rec.onerror = (e: any) => console.warn("SpeechRec error:", e);
          rec.start();
          speechRecRef.current = rec;
        } catch (e) {
          console.warn("SpeechRec no disponible:", e);
        }
      }

      // 2. Grabar audio con MediaRecorder
      let selectedMimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          selectedMimeType = "audio/webm;codecs=opus";
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
          // Usar la transcripción real obtenida por voz
          const textValue = (document.getElementById("input-diary-text") as HTMLTextAreaElement)
            ?.value || inputText;
          const cleanText = textValue.trim();

          onLogTextOrVoice({
            audioBase64: base64,
            audioMimeType: actualMime,
            text: cleanText ? `Para mi ${selectedMealTarget}: ${cleanText}` : undefined,
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
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch (e) {}
      speechRecRef.current = null;
    }

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
    const textToSubmit = `Para mi ${selectedMealTarget}: ${inputText.trim()}`;
    setInputText("");
    onLogTextOrVoice({ text: textToSubmit });
  };

  // Ajustar peso en gramos de cualquier alimento con recálculo determinista BEDCA / USDA
  const handleApplyWeightChange = (
    sectionId: "desayuno" | "comida" | "cena",
    itemIndex: number,
    item: DiaryItem,
    newWeight: number
  ) => {
    const safeWeight = Math.max(5, Math.min(2000, newWeight));
    const labMatch = calibrarIngredienteConLaboratorio(item.nombre, safeWeight);

    let updatedItem: DiaryItem;
    if (labMatch) {
      updatedItem = {
        ...item,
        peso_g: safeWeight,
        calorias: labMatch.calorias,
        proteinas_g: labMatch.proteinas_g,
        carbohidratos_g: labMatch.carbohidratos_g,
        grasas_g: labMatch.grasas_g,
        fibra_g: labMatch.fibra_g,
        sodio_mg: labMatch.sodio_mg,
        fuente_verificada: {
          base_datos: labMatch.alimento_base.fuente,
          codigo_referencia: labMatch.alimento_base.codigo_referencia,
          nombre_oficial: labMatch.alimento_base.nombre_oficial,
          similitud: labMatch.similitud,
        },
      };
    } else {
      const ratio = safeWeight / Math.max(1, item.peso_g);
      updatedItem = {
        ...item,
        peso_g: safeWeight,
        calorias: Math.round(item.calorias * ratio),
        proteinas_g: Number((item.proteinas_g * ratio).toFixed(1)),
        carbohidratos_g: Number((item.carbohidratos_g * ratio).toFixed(1)),
        grasas_g: Number((item.grasas_g * ratio).toFixed(1)),
        fibra_g: item.fibra_g ? Number((item.fibra_g * ratio).toFixed(1)) : 0,
        sodio_mg: item.sodio_mg ? Math.round(item.sodio_mg * ratio) : 0,
      };
    }

    setMealsState((prev) => {
      const list = [...(prev[sectionId] || [])];
      list[itemIndex] = updatedItem;
      return { ...prev, [sectionId]: list };
    });

    onUpdateDirectItem?.(sectionId, itemIndex, updatedItem);
  };

  const handleDeleteMealItem = (
    sectionId: "desayuno" | "comida" | "cena",
    itemIndex: number,
    item: DiaryItem
  ) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setMealsState((prev) => {
      const list = [...(prev[sectionId] || [])];
      const updated = list.filter((_, idx) => idx !== itemIndex);
      return { ...prev, [sectionId]: updated };
    });
    if (editingItemKey === `${sectionId}-${itemIndex}`) {
      setEditingItemKey(null);
    }
    onDeleteDirectItem?.(sectionId, itemIndex, item);
  };

  // Secciones estructuradas del día
  const mealSections = useMemo<MealSection[]>(() => {
    return [
      {
        id: "desayuno",
        title: "Desayuno",
        defaultTime: "08:30",
        recommendedKcal: Math.round(targetKcal * 0.25),
        items: mealsState.desayuno || [],
      },
      {
        id: "comida",
        title: "Comida",
        defaultTime: "14:00",
        recommendedKcal: Math.round(targetKcal * 0.45),
        items: mealsState.comida || [],
      },
      {
        id: "cena",
        title: "Cena",
        defaultTime: "21:00",
        recommendedKcal: Math.round(targetKcal * 0.3),
        items: mealsState.cena || [],
      },
    ];
  }, [mealsState, targetKcal]);

  // Totales globales en tiempo real
  const totalKcal = useMemo(
    () => mealSections.reduce((acc, sec) => acc + sec.items.reduce((s, it) => s + it.calorias, 0), 0),
    [mealSections]
  );
  const totalProteinas = useMemo(
    () => mealSections.reduce((acc, sec) => acc + sec.items.reduce((s, it) => s + it.proteinas_g, 0), 0),
    [mealSections]
  );
  const totalCarbs = useMemo(
    () => mealSections.reduce((acc, sec) => acc + sec.items.reduce((s, it) => s + it.carbohidratos_g, 0), 0),
    [mealSections]
  );
  const totalGrasas = useMemo(
    () => mealSections.reduce((acc, sec) => acc + sec.items.reduce((s, it) => s + it.grasas_g, 0), 0),
    [mealSections]
  );
  const totalFibra = useMemo(
    () => mealSections.reduce((acc, sec) => acc + sec.items.reduce((s, it) => s + (it.fibra_g || 0), 0), 0),
    [mealSections]
  );
  const totalSodio = useMemo(
    () => mealSections.reduce((acc, sec) => acc + sec.items.reduce((s, it) => s + (it.sodio_mg || 0), 0), 0),
    [mealSections]
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2 select-none">
      {/* 1. Selector de Calendario y Racha de Días (siempre anclado en Hoy) */}
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
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">🌾 Fibra Dietética</span>
          <p className="text-sm font-black text-emerald-950 font-mono">
            {totalFibra.toFixed(1)} <span className="text-xs font-normal text-emerald-700">/ 35 g</span>
          </p>
          <span className="text-[9px] text-emerald-600 font-medium">Saciedad y salud intestinal</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">🧂 Sodio Estimado</span>
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

        {/* Selector de Comida Objetivo (Desayuno, Comida, Cena) */}
        <div className="flex items-center justify-between gap-1 p-1 bg-white rounded-2xl border border-stone-200/80">
          {(["desayuno", "comida", "cena"] as const).map((meal) => {
            const isSelected = selectedMealTarget === meal;
            const label = meal === "desayuno" ? "☀️ Desayuno" : meal === "comida" ? "🍲 Comida" : "🌙 Cena";
            return (
              <button
                key={meal}
                type="button"
                onClick={() => setSelectedMealTarget(meal)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                  isSelected
                    ? "bg-fitia-yellow text-fitia-dark shadow-2xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

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
                aria-label="Iniciar dictado por voz"
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

        {/* Input de texto manual alternativo o transcripción en tiempo real */}
        <form onSubmit={handleSubmitText} className="space-y-2">
          <div className="relative">
            <textarea
              id="input-diary-text"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej: 200g carne de mechar, 50g arroz y 100g ensalada..."
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
            <span>{isProcessing ? "Interpretando alimentos..." : `Registrar en ${selectedMealTarget.charAt(0).toUpperCase() + selectedMealTarget.slice(1)}`}</span>
          </button>
        </form>
      </div>

      {/* MICROCOPY EMPÁTICO DE FITIA */}
      <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 text-center">
        <p className="text-xs font-medium text-amber-950 leading-relaxed">
          &ldquo;Puedes tocar el lápiz ✏️ en cualquier alimento para ajustar los gramos exactos que comiste.&rdquo;
        </p>
      </div>

      {/* TARJETAS LIMPIAS PARA DESAYUNO, COMIDA Y CENA CON EDICIÓN DE GRAMOS INDIVIDUAL */}
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
              {/* Encabezado de la comida con total y botón Añadir */}
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

                  {/* Botón Añadir directo a esta comida */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "vibrate" in navigator) {
                        navigator.vibrate?.(20);
                      }
                      setSelectedMealTarget(section.id);
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

              {/* Lista detallada de alimentos con edición individual de gramos */}
              {section.items.length > 0 ? (
                <div className="space-y-2 pt-1 border-t border-neutral-50">
                  {section.items.map((item, idx) => {
                    const itemKey = `${section.id}-${idx}`;
                    const isEditing = editingItemKey === itemKey;

                    return (
                      <div
                        key={itemKey}
                        className={`p-3 rounded-2xl border transition-all ${
                          isEditing
                            ? "border-fitia-yellow bg-amber-50/40 shadow-xs"
                            : "border-neutral-100 bg-neutral-50/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <p className="font-bold text-xs text-neutral-900 truncate">
                                {item.nombre}
                              </p>
                              {item.fuente_verificada && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                                  <span>
                                    {item.fuente_verificada.codigo_referencia ||
                                      item.fuente_verificada.base_datos}
                                  </span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              {item.peso_g} g • P: {item.proteinas_g}g | C: {item.carbohidratos_g}g | G:{" "}
                              {item.grasas_g}g
                              {item.fibra_g ? ` | Fibra: ${item.fibra_g}g` : ""}
                              {item.sodio_mg ? ` | Sodio: ${item.sodio_mg}mg` : ""}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-black text-neutral-900 font-mono block">
                                {item.calorias}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase">kcal</span>
                            </div>

                            {/* Botón de lápiz para editar gramos exactos */}
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== "undefined" && "vibrate" in navigator) {
                                  navigator.vibrate?.(20);
                                }
                                if (isEditing) {
                                  setEditingItemKey(null);
                                } else {
                                  setEditingItemKey(itemKey);
                                  setEditingWeight(item.peso_g);
                                }
                              }}
                              aria-label={`Editar gramos de ${item.nombre}`}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-95 ${
                                isEditing
                                  ? "bg-fitia-yellow text-fitia-dark font-bold shadow-xs"
                                  : "bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900"
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Botón de eliminar */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMealItem(section.id, idx, item)}
                              aria-label={`Eliminar ${item.nombre}`}
                              title={`Eliminar ${item.nombre}`}
                              className="w-8 h-8 rounded-xl bg-white text-stone-300 hover:text-rose-600 border border-neutral-200 flex items-center justify-center transition active:scale-90"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Panel de calibración y edición de gramos */}
                        {isEditing && (
                          <div className="mt-2.5 pt-2.5 border-t border-neutral-200/70 flex flex-col gap-2 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-neutral-600">
                                  Gramos consumidos:
                                </span>
                                <input
                                  type="number"
                                  min={5}
                                  max={2000}
                                  value={editingWeight}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditingWeight(val);
                                    handleApplyWeightChange(section.id, idx, item, val);
                                  }}
                                  className="w-20 h-9 px-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-900 bg-white text-center focus:border-fitia-yellow focus:outline-none"
                                />
                                <span className="text-xs font-bold text-neutral-500">g</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setEditingItemKey(null)}
                                className="px-3 py-1.5 rounded-xl bg-fitia-yellow text-fitia-dark text-xs font-black active:scale-95 shadow-2xs"
                              >
                                Listo
                              </button>
                            </div>

                            {/* Botones de ajuste rápido en gramos */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-neutral-400 font-semibold">
                                Ajuste rápido:
                              </span>
                              {[-50, -25, +25, +50, +100].map((delta) => (
                                <button
                                  key={delta}
                                  type="button"
                                  onClick={() => {
                                    const nextW = Math.max(5, editingWeight + delta);
                                    setEditingWeight(nextW);
                                    handleApplyWeightChange(section.id, idx, item, nextW);
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 text-[10px] font-bold active:scale-95"
                                >
                                  {delta > 0 ? `+${delta}` : delta}g
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          const newItem: DiaryItem = {
            id: `barcode-${Date.now()}`,
            nombre: item.nombre,
            peso_g: item.peso_g || 100,
            calorias: item.calorias,
            proteinas_g: item.proteinas_g,
            carbohidratos_g: item.carbohidratos_g,
            grasas_g: item.grasas_g,
            fibra_g: item.fibra_g,
            sodio_mg: item.sodio_mg,
          };

          setMealsState((prev) => ({
            ...prev,
            [secId]: [...(prev[secId] || []), newItem],
          }));

          onAddDirectItem?.(item, time);
        }}
      />
    </div>
  );
};
