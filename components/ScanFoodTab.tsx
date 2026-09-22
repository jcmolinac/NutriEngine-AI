"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Camera,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Scale,
  HelpCircle,
  Check,
  X,
  SlidersVertical,
  Pencil,
  Box,
  ShieldCheck,
  Mic,
} from "lucide-react";
import { EscaneoComida, IngredienteReconocido } from "@/types/nutrition";
import { calibrarIngredienteConLaboratorio } from "@/lib/verified-nutrition-db";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { MacroBar } from "./MacroBar";
import { PhotoQualityModal } from "./PhotoQualityModal";
import { FitiaButton } from "./FitiaButton";
import { DualAngleCaptureModal } from "./DualAngleCaptureModal";

interface ScanFoodTabProps {
  escaneoData: EscaneoComida;
  onScanImage: (base64: string, mimeType: string, userHint?: string) => Promise<void>;
  isProcessing: boolean;
  onOpenLiveCamera?: () => void;
  externalCapturedImage?: string | null;
  onUpdateEscaneoData?: (updated: EscaneoComida) => void;
}

export const ScanFoodTab: React.FC<ScanFoodTabProps> = ({
  escaneoData,
  onScanImage,
  isProcessing,
  onOpenLiveCamera,
  externalCapturedImage,
  onUpdateEscaneoData,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userHint, setUserHint] = useState<string>("");
  const [customDishTitle, setCustomDishTitle] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitleInput, setTempTitleInput] = useState("");
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showDualAngleModal, setShowDualAngleModal] = useState(false);
  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<number, boolean | null>>({});
  const [editingIngredientIdx, setEditingIngredientIdx] = useState<number | null>(null);
  const [customWeightsOverride, setCustomWeightsOverride] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHintRecording, setIsHintRecording] = useState(false);
  const hintSpeechRecRef = useRef<any>(null);

  const toggleHintVoice = () => {
    if (isHintRecording) {
      if (hintSpeechRecRef.current) {
        try {
          hintSpeechRecRef.current.stop();
        } catch (e) {}
        hintSpeechRecRef.current = null;
      }
      setIsHintRecording(false);
      return;
    }

    const SpeechRec =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRec) {
      alert("El dictado por voz no está soportado en este navegador.");
      return;
    }

    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(25);
      }
      const rec = new SpeechRec();
      rec.lang = "es-ES";
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (evt: any) => {
        let transcript = "";
        for (let i = 0; i < evt.results.length; i++) {
          transcript += evt.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setUserHint(transcript.trim());
        }
      };
      rec.onend = () => setIsHintRecording(false);
      rec.onerror = () => setIsHintRecording(false);
      rec.start();
      hintSpeechRecRef.current = rec;
      setIsHintRecording(true);
    } catch (e) {
      console.warn("No se pudo iniciar dictado:", e);
      setIsHintRecording(false);
    }
  };

  const displayImage = externalCapturedImage || previewImage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      setCustomDishTitle(null);
      onScanImage(base64, file.type || "image/jpeg", userHint.trim() || undefined);
    };
    reader.readAsDataURL(file);
  };

  const {
    nombre_plato: rawDishName,
    peso_total_preparado_g,
    peso_g,
    calorias_totales = 0,
    metodo_coccion_inferido = "natural",
    puntuacion_confianza = 0.95,
    micro_preguntas_confirmacion = [
      "¿Se utilizó aceite de oliva o mantequilla al cocinar el plato?",
      "¿El plato incluye alguna salsa o aderezo no visible?",
      "¿El peso total de la porción se ajusta a lo que ves?",
    ],
    alternativas_posibles = [],
    control_calidad,
    macronutrientes = {
      proteinas_g: 0,
      carbohidratos_g: 0,
      grasas_g: 0,
      porcentaje_proteinas: 0,
      porcentaje_carbohidratos: 0,
      porcentaje_grasas: 0,
    },
    ingredientes = [],
    consejo_coach,
    fuente_verificada_principal,
  } = escaneoData || {};

  const nombre_plato = customDishTitle || rawDishName;

  const isUnrecognized =
    nombre_plato === "Alimento no detectado" ||
    nombre_plato === "No se pudo identificar el alimento" ||
    puntuacion_confianza === 0;

  // IMPORTANT: When isProcessing is true, NEVER render stale dish results!
  const hasScannedDish = Boolean(!isProcessing && (displayImage || (nombre_plato && !isUnrecognized)));

  const baseWeight = (peso_total_preparado_g ?? peso_g) || 0;

  // Derivar pesos combinando valores del backend y ediciones manuales del usuario
  const getIngredientWeight = (idx: number, fallback: number) => {
    return customWeightsOverride[idx] !== undefined ? customWeightsOverride[idx] : fallback;
  };

  const currentTotalWeight = ingredientes?.length
    ? ingredientes.reduce((acc, ing, idx) => acc + getIngredientWeight(idx, ing.peso_g || ing.peso_estimado_g || 0), 0)
    : baseWeight;

  const scaleRatio = baseWeight > 0 ? currentTotalWeight / baseWeight : 1;
  const currentCalories = Math.round(calorias_totales * scaleRatio);

  const handleWeightChange = (index: number, newWeight: number) => {
    const val = Math.max(0, newWeight);
    setCustomWeightsOverride((prev) => ({
      ...prev,
      [index]: val,
    }));
  };

  const handleSelectAlternative = (alt: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    setCustomDishTitle(alt);

    if (onUpdateEscaneoData) {
      const weight = currentTotalWeight || 228;
      const labMatch = calibrarIngredienteConLaboratorio(alt, weight);

      if (labMatch) {
        const totalKcal = Math.max(1, labMatch.calorias);
        const protPct = Math.round(((labMatch.proteinas_g * 4) / totalKcal) * 100);
        const fatPct = Math.round(((labMatch.grasas_g * 9) / totalKcal) * 100);
        const carbPct = Math.max(0, 100 - protPct - fatPct);

        const verifiedFuente = {
          base_datos: labMatch.alimento_base.fuente,
          codigo_referencia: labMatch.alimento_base.codigo_referencia,
          nombre_oficial: labMatch.alimento_base.nombre_oficial,
          similitud: labMatch.similitud,
        };

        onUpdateEscaneoData({
          ...escaneoData,
          nombre_plato: alt,
          peso_total_preparado_g: weight,
          peso_g: weight,
          calorias_totales: labMatch.calorias,
          fuente_verificada_principal: verifiedFuente,
          macronutrientes: {
            proteinas_g: labMatch.proteinas_g,
            grasas_g: labMatch.grasas_g,
            carbohidratos_g: labMatch.carbohidratos_g,
            porcentaje_proteinas: protPct,
            porcentaje_grasas: fatPct,
            porcentaje_carbohidratos: carbPct,
            fibra_total_g: labMatch.fibra_g,
            sodio_total_mg: labMatch.sodio_mg,
            hierro_total_mg: labMatch.hierro_mg,
          },
          ingredientes: [
            {
              alimento: alt,
              peso_estimado_g: weight,
              peso_g: weight,
              calorias: labMatch.calorias,
              proteinas_g: labMatch.proteinas_g,
              grasas_g: labMatch.grasas_g,
              carbohidratos_g: labMatch.carbohidratos_g,
              fibra_g: labMatch.fibra_g,
              sodio_mg: labMatch.sodio_mg,
              hierro_mg: labMatch.hierro_mg,
              fuente_verificada: verifiedFuente,
            },
          ],
        });
        return;
      }

      const isBeef =
        alt.toLowerCase().includes("res") ||
        alt.toLowerCase().includes("mechar") ||
        alt.toLowerCase().includes("mechada") ||
        alt.toLowerCase().includes("ternera");
      const isPork = alt.toLowerCase().includes("cerdo") || alt.toLowerCase().includes("carnitas");
      const isChicken = alt.toLowerCase().includes("pollo");

      let newCal = calorias_totales;
      let newProt = macronutrientes.proteinas_g;
      let newFat = macronutrientes.grasas_g;
      let newCarb = macronutrientes.carbohidratos_g;

      if (isBeef) {
        newCal = Math.round((weight / 100) * 215);
        newProt = Math.round((weight / 100) * 30);
        newFat = Math.round((weight / 100) * 10);
        newCarb = Math.round((weight / 100) * 1.5);
      } else if (isChicken) {
        newCal = Math.round((weight / 100) * 165);
        newProt = Math.round((weight / 100) * 31);
        newFat = Math.round((weight / 100) * 4);
        newCarb = Math.round((weight / 100) * 1);
      } else if (isPork) {
        newCal = Math.round((weight / 100) * 240);
        newProt = Math.round((weight / 100) * 26);
        newFat = Math.round((weight / 100) * 14);
        newCarb = Math.round((weight / 100) * 1);
      }

      const totalKcal = Math.max(1, newCal);
      const protPct = Math.round(((newProt * 4) / totalKcal) * 100);
      const fatPct = Math.round(((newFat * 9) / totalKcal) * 100);
      const carbPct = Math.max(0, 100 - protPct - fatPct);

      onUpdateEscaneoData({
        ...escaneoData,
        nombre_plato: alt,
        peso_total_preparado_g: weight,
        peso_g: weight,
        calorias_totales: newCal,
        macronutrientes: {
          proteinas_g: newProt,
          grasas_g: newFat,
          carbohidratos_g: newCarb,
          porcentaje_proteinas: protPct,
          porcentaje_grasas: fatPct,
          porcentaje_carbohidratos: carbPct,
        },
        ingredientes: [
          {
            alimento: alt,
            peso_estimado_g: weight,
            peso_g: weight,
            calorias: newCal,
            proteinas_g: newProt,
            grasas_g: newFat,
            carbohidratos_g: newCarb,
          },
        ],
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2 select-none">
      {/* Visual Camera Action Card */}
      <div className="bg-fitia-cream rounded-4xl border border-stone-200/80 p-4 shadow-sm space-y-3">
        {/* Preview image or Camera viewfinder trigger */}
        <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-stone-900 border border-stone-200 flex items-center justify-center">
          {displayImage ? (
            <>
              <Image
                src={displayImage}
                alt={nombre_plato || "Plato escaneado"}
                fill
                className="object-cover"
                unoptimized
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Status Pill on image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] text-white font-medium">
                <span className="w-2 h-2 rounded-full bg-fitia-green animate-pulse" />
                <span>Escáner IA Activo</span>
              </div>

              {/* Quality Modal Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowEducationModal(true)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-fitia-yellow/60 text-[10px] text-fitia-yellow font-bold active:scale-95 transition"
              >
                Guía de foto ℹ️
              </button>

              {/* Bottom Dish Title overlay or Analyzing indicator */}
              {isProcessing ? (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                  <div className="relative w-14 h-14 mb-2.5 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-fitia-yellow border-t-transparent animate-spin" />
                    <Sparkles className="w-6 h-6 text-fitia-yellow animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white tracking-tight">Analizando alimento con IA...</p>
                    <p className="text-xs text-stone-300 font-medium">Estimando volumen tridimensional y macronutrientes...</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-fitia-yellow to-transparent animate-pulse" />
                </div>
              ) : (
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h4 className="text-white font-black text-sm tracking-tight drop-shadow-md">
                      {nombre_plato || "Plato identificado"}
                    </h4>
                    <p className="text-stone-300 text-xs drop-shadow-sm font-medium">
                      {currentCalories} kcal • {currentTotalWeight} g preparado
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-fitia-yellow text-fitia-dark text-[10px] font-black uppercase">
                    {metodo_coccion_inferido}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6 space-y-3 text-stone-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-fitia-yellow/20 text-fitia-yellow flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Captura tu plato</p>
                <p className="text-xs text-stone-400">
                  Usa la cámara trasera vertical para evaluar volumen y macros
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Campo opcional de pista rápida o dictado por voz para máxima precisión */}
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={userHint}
              onChange={(e) => setUserHint(e.target.value)}
              placeholder={
                isHintRecording
                  ? "🎙️ Escuchando... di el plato o gramos"
                  : "💡 Pista o dictado: ej. carne de mechar 200g..."
              }
              disabled={isProcessing}
              className={`w-full h-10 pl-3.5 pr-16 text-xs font-semibold rounded-2xl border bg-white text-stone-900 focus:outline-none transition shadow-2xs ${
                isHintRecording
                  ? "border-rose-500 ring-2 ring-rose-100 bg-rose-50/20"
                  : "border-stone-200 focus:border-fitia-yellow placeholder:text-stone-400"
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {userHint && !isHintRecording && (
                <button
                  type="button"
                  onClick={() => setUserHint("")}
                  className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-[10px] hover:bg-stone-200"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={toggleHintVoice}
                aria-label="Dictar pista por voz"
                title="Dictar pista o peso por voz"
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition active:scale-95 ${
                  isHintRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Píldoras de escala métrica para calibración de volumen */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-stone-500 font-bold">Escala 3D:</span>
            {[
              { label: "🍽️ Plato 25cm", hint: "Plato llano 25cm" },
              { label: "🍴 Tenedor 20cm", hint: "Tenedor 20cm referencia" },
              { label: "🪙 Moneda 2€", hint: "Moneda 2€ referencia 2.6cm" },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  setUserHint((prev) => (prev ? `${prev} (${m.hint})` : m.hint));
                }}
                className="px-2 py-0.5 rounded-lg bg-white border border-stone-200/90 hover:bg-stone-50 text-[10px] text-stone-700 font-semibold active:scale-95 transition"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex gap-2">
          <FitiaButton
            id="btn-open-camera-viewfinder"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(35);
              }
              setShowEducationModal(true);
            }}
            disabled={isProcessing}
            className="flex-1 !py-3.5 flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5 text-fitia-dark" />
            <span>{isProcessing ? "Analizando plato..." : "Escanear Plato"}</span>
          </FitiaButton>

          <button
            type="button"
            id="btn-upload-dish-file"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            aria-label="Subir foto desde galería"
            className="w-14 h-14 min-h-[44px] min-w-[44px] rounded-full bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200 shadow-sm transition active:scale-95"
          >
            <UploadCloud className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="btn-dual-angle-3d"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(25);
              }
              setShowDualAngleModal(true);
            }}
            disabled={isProcessing}
            aria-label="Doble toma 3D estereoscópica"
            title="Doble toma 3D (Cenital 90° + Lateral 45°)"
            className="w-14 h-14 min-h-[44px] min-w-[44px] rounded-full bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 flex flex-col items-center justify-center border border-stone-200 shadow-sm transition active:scale-95"
          >
            <Box className="w-5 h-5 text-stone-800" />
            <span className="text-[8px] font-black text-emerald-700 -mt-0.5">3D</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {isUnrecognized && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Alimento o producto no identificado</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            {control_calidad?.advertencia_precision ||
              "No se detectó un alimento claro en la imagen. Por favor enfoca de nuevo tu comida o producto con buena iluminación."}
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white rounded-4xl border border-stone-200 p-6 shadow-sm text-center space-y-3.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-fitia-yellow/20 flex items-center justify-center text-fitia-dark">
            <Sparkles className="w-6 h-6 animate-spin text-fitia-dark" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-fitia-dark">Analizando imagen con IA...</h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Estimando densidad, método de preparación y macronutrientes precisos
            </p>
          </div>
          <div className="h-1.5 w-40 mx-auto bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-fitia-yellow rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {hasScannedDish ? (
        <>
          {/* PANTALLA DE RESULTADOS TRAS ESCANEAR */}
          <div className="bg-white rounded-4xl border border-neutral-100 p-5 shadow-sm space-y-4">
        {/* Encabezado con Nombre Editable y Porción Preparada */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Resultado Escáner IA
            </span>
            <button
              type="button"
              onClick={() => {
                setTempTitleInput(nombre_plato || "");
                setIsEditingTitle(!isEditingTitle);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-fitia-dark px-2 py-0.5 rounded-lg hover:bg-stone-100 transition active:scale-95"
              title="Editar nombre del plato"
            >
              <Pencil className="w-3 h-3 text-stone-600" />
              <span>{isEditingTitle ? "Cancelar" : "Editar"}</span>
            </button>
          </div>

          {isEditingTitle ? (
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                value={tempTitleInput}
                onChange={(e) => setTempTitleInput(e.target.value)}
                placeholder="Ej. Carne de mechar de res"
                className="flex-1 h-9 rounded-xl border border-stone-300 px-3 text-xs font-bold text-stone-900 bg-stone-50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (tempTitleInput.trim()) {
                    setCustomDishTitle(tempTitleInput.trim());
                  }
                  setIsEditingTitle(false);
                }}
                className="h-9 px-3 rounded-xl bg-fitia-yellow text-fitia-dark font-black text-xs hover:bg-[#F5BF00] transition active:scale-95"
              >
                Guardar
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-black text-fitia-dark leading-tight mt-0.5">
              {nombre_plato || "Plato listo"}
            </h3>
          )}
          <p className="text-xs font-medium text-neutral-500 mt-1">
            Datos por 1 porción ({currentTotalWeight} g) preparado
          </p>

          {/* Badge de Certificación con Tablas Oficiales BEDCA / USDA */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>
                {fuente_verificada_principal?.base_datos === "BEDCA"
                  ? `Calibrado BEDCA (${fuente_verificada_principal.codigo_referencia || "España"})`
                  : fuente_verificada_principal?.base_datos === "USDA"
                  ? `Calibrado USDA (${fuente_verificada_principal.codigo_referencia || "EE.UU."})`
                  : "Calibrado BEDCA / USDA FoodData"}
              </span>
            </span>
            {fuente_verificada_principal?.nombre_oficial && (
              <span className="text-[10px] text-stone-500 font-medium truncate max-w-[220px]" title={fuente_verificada_principal.nombre_oficial}>
                • {fuente_verificada_principal.nombre_oficial}
              </span>
            )}
          </div>
        </div>

        {/* Selector interactivo de tipo de carne / alternativas rápidas */}
        {(() => {
          const lowerName = (nombre_plato || "").toLowerCase();
          const isShreddedOrMeat =
            lowerName.includes("deshebrad") ||
            lowerName.includes("mechada") ||
            lowerName.includes("mechar") ||
            lowerName.includes("pollo") ||
            lowerName.includes("res") ||
            lowerName.includes("cerdo") ||
            alternativas_posibles.length > 0;

          if (!isShreddedOrMeat) return null;

          const defaultAlternatives = [
            "Carne de mechar (Res/Ternera)",
            "Pollo deshebrado",
            "Cerdo deshebrado / Carnitas",
          ];
          const list = alternativas_posibles.length > 0 ? alternativas_posibles : defaultAlternatives;

          return (
            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                <span>¿Es otro tipo de carne o preparación?</span>
                <span className="text-[10px] text-fitia-dark font-bold">1 toque para cambiar</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {list.map((alt, i) => {
                  const isSelected = lowerName.includes(alt.toLowerCase().slice(0, 8));
                  const emoji = alt.toLowerCase().includes("pollo")
                    ? "🍗"
                    : alt.toLowerCase().includes("cerdo")
                    ? "🐖"
                    : "🥩";

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectAlternative(alt)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                        isSelected
                          ? "bg-fitia-yellow text-fitia-dark border border-fitia-dark/20 shadow-xs"
                          : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{alt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Calorías totales destacadas */}
        <div className="flex items-baseline justify-between py-2 px-3 rounded-2xl bg-neutral-50 border border-neutral-100">
          <span className="text-xs font-bold text-neutral-600">Calorías Totales</span>
          <div className="text-right">
            <span className="text-2xl font-black text-fitia-dark font-mono">
              {currentCalories}
            </span>{" "}
            <span className="text-xs font-bold text-neutral-400">kcal</span>
          </div>
        </div>

        {/* Barra continua horizontal proporcional dividida en los 3 colores de macros */}
        <div className="space-y-1.5 pt-1">
          <MacroBar
            proteinPct={macronutrientes?.porcentaje_proteinas ?? 0}
            carbsPct={macronutrientes?.porcentaje_carbohidratos ?? 0}
            fatPct={macronutrientes?.porcentaje_grasas ?? 0}
          />

          {/* Tarjetas de macros en gramos */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2 rounded-2xl bg-macro-protein/10 border border-macro-protein/25">
              <span className="text-[10px] font-bold text-macro-protein uppercase block">Proteína</span>
              <p className="text-sm font-black text-fitia-dark font-mono">
                {Math.round((macronutrientes?.proteinas_g ?? 0) * scaleRatio)} g
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-macro-carbs/15 border border-macro-carbs/35">
              <span className="text-[10px] font-bold text-[#A86F28] uppercase block">Carbos</span>
              <p className="text-sm font-black text-fitia-dark font-mono">
                {Math.round((macronutrientes?.carbohidratos_g ?? 0) * scaleRatio)} g
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-macro-fat/15 border border-macro-fat/35">
              <span className="text-[10px] font-bold text-[#635F2B] uppercase block">Grasas</span>
              <p className="text-sm font-black text-fitia-dark font-mono">
                {Math.round((macronutrientes?.grasas_g ?? 0) * scaleRatio)} g
              </p>
            </div>
          </div>

          {/* Micronutrientes de laboratorio */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
            <div className="py-1.5 px-2 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[9px] font-bold text-stone-500 uppercase block">🌾 Fibra</span>
              <span className="text-xs font-black text-stone-800 font-mono">
                {Math.round((macronutrientes?.fibra_total_g ?? 0) * scaleRatio * 10) / 10} g
              </span>
            </div>
            <div className="py-1.5 px-2 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[9px] font-bold text-stone-500 uppercase block">🧂 Sodio</span>
              <span className="text-xs font-black text-stone-800 font-mono">
                {Math.round((macronutrientes?.sodio_total_mg ?? 0) * scaleRatio)} mg
              </span>
            </div>
            <div className="py-1.5 px-2 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[9px] font-bold text-stone-500 uppercase block">🩸 Hierro</span>
              <span className="text-xs font-black text-stone-800 font-mono">
                {macronutrientes?.hierro_total_mg ? Math.round(macronutrientes.hierro_total_mg * scaleRatio * 100) / 100 : 0.8} mg
              </span>
            </div>
          </div>
        </div>

        {/* LISTA DETALLADA DE INGREDIENTES CON BOTÓN DE LÁPIZ PARA EDITAR GRAMOS */}
        <div className="space-y-2.5 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Ingredientes Detectados ({ingredientes?.length || 0})
            </h4>
            <span className="text-[10px] font-medium text-neutral-400">
              Toca ✏️ para calibrar gramos
            </span>
          </div>

          <div className="space-y-2">
            {ingredientes?.map((ing: IngredienteReconocido, idx: number) => {
              const currentWeight = getIngredientWeight(idx, ing.peso_g || ing.peso_estimado_g || 100);
              const ingScale = (ing.peso_g || ing.peso_estimado_g || 100) > 0
                ? currentWeight / (ing.peso_g || ing.peso_estimado_g || 100)
                : 1;
              const ingKcal = Math.round((ing.calorias || 0) * ingScale);
              const isEditing = editingIngredientIdx === idx;
              const isOil =
                ing.alimento.toLowerCase().includes("aceite") ||
                ing.alimento.toLowerCase().includes("salsa");

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    isEditing
                      ? "border-fitia-yellow bg-amber-50/40"
                      : isOil
                      ? "border-amber-200 bg-amber-50/20"
                      : "border-neutral-100 bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOil ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                        <span className="text-xs font-bold text-neutral-900">{ing.alimento}</span>
                        {ing.fuente_verificada && ing.fuente_verificada.base_datos !== "AI_ESTIMATED" && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                            <span>{ing.fuente_verificada.codigo_referencia || ing.fuente_verificada.base_datos}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        P: {Math.round((ing.proteinas_g || 0) * ingScale)}g • C:{" "}
                        {Math.round((ing.carbohidratos_g || 0) * ingScale)}g • G:{" "}
                        {Math.round((ing.grasas_g || 0) * ingScale)}g
                        {typeof ing.fibra_g === "number" && ing.fibra_g > 0 && ` • Fibra: ${Math.round(ing.fibra_g * ingScale * 10) / 10}g`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-sm font-black text-neutral-900 font-mono block">
                          {ingKcal}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">kcal</span>
                      </div>

                      {/* Botón / Icono de lápiz para editar individualmente cada gramo */}
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined" && "vibrate" in navigator) {
                            navigator.vibrate?.(20);
                          }
                          setEditingIngredientIdx(isEditing ? null : idx);
                        }}
                        aria-label={`Editar gramos de ${ing.alimento}`}
                        className={`w-9 h-9 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition active:scale-95 ${
                          isEditing
                            ? "bg-fitia-yellow text-fitia-dark font-bold shadow-xs"
                            : "bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900"
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Panel de edición de gramos individual desplegable */}
                  {isEditing && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-200/70 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-neutral-600">
                          Peso (g):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={1500}
                          value={currentWeight}
                          onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                          className="w-20 h-10 px-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-900 bg-white text-center focus:border-fitia-yellow focus:outline-none"
                        />
                      </div>

                      {/* Presets rápidos */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleWeightChange(idx, Math.max(0, currentWeight - 25))}
                          className="px-2 py-1 rounded-lg bg-neutral-200 text-neutral-700 text-xs font-bold active:scale-95"
                        >
                          -25
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(idx, currentWeight + 25)}
                          className="px-2 py-1 rounded-lg bg-neutral-200 text-neutral-700 text-xs font-bold active:scale-95"
                        >
                          +25
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIngredientIdx(null)}
                          className="px-2.5 py-1 rounded-lg bg-fitia-yellow text-fitia-dark text-xs font-black active:scale-95"
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón para ver desglose completo y calidad volumétrica */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(20);
            }
            setShowDetailSheet(true);
          }}
          className="w-full h-11 min-h-[44px] rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200 transition active:scale-98"
        >
          <SlidersVertical className="w-4 h-4 text-emerald-600" />
          <span>Ver Calidad de Toma y Geometría 3D</span>
        </button>
      </div>

      {/* MICRO-PREGUNTAS DE CONFIRMACIÓN (Salsas / Aceites de cocción) */}
      <div className="bg-white rounded-4xl border border-neutral-100 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-neutral-900">
          <HelpCircle className="w-4 h-4 text-fitia-dark" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Confirmación de Cocción
          </h4>
        </div>
        <p className="text-[11px] text-neutral-500 leading-snug">
          Confirma si el plato contiene salsas o aceites añadidos para garantizar la máxima exactitud calórica:
        </p>

        <div className="space-y-2.5">
          {micro_preguntas_confirmacion.map((pregunta, idx) => {
            const status = confirmedQuestions[idx];
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2.5"
              >
                <p className="text-xs font-semibold text-neutral-800 leading-snug">
                  {pregunta}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "vibrate" in navigator) {
                        navigator.vibrate?.(25);
                      }
                      setConfirmedQuestions((prev) => ({ ...prev, [idx]: true }));
                    }}
                    className={`flex-1 h-11 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      status === true
                        ? "bg-fitia-yellow text-fitia-dark font-black shadow-xs"
                        : "bg-white text-neutral-700 border border-neutral-200 active:bg-neutral-100"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Sí</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "vibrate" in navigator) {
                        navigator.vibrate?.(25);
                      }
                      setConfirmedQuestions((prev) => ({ ...prev, [idx]: false }));
                    }}
                    className={`flex-1 h-11 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      status === false
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-white text-neutral-700 border border-neutral-200 active:bg-neutral-100"
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>No</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

          {/* Consejo del Coach Nutricional */}
          {consejo_coach && (
            <div className="p-4 rounded-3xl bg-amber-50/60 border border-amber-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-fitia-dark" />
                <span>Consejo Fitia IA</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">{consejo_coach}</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-4xl border border-stone-200/90 p-6 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-fitia-yellow/25 text-fitia-dark flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6 text-fitia-dark" />
          </div>
          <div>
            <h4 className="text-sm font-black text-fitia-dark">
              Sin plato escaneado
            </h4>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Toma una foto de tu comida, sube una imagen de tu galería o toca uno de los platos de referencia para calibrar volumen e ingredientes con IA.
            </p>
          </div>
        </div>
      )}

      {/* Modal Educativo previo de Calidad Fotográfica */}
      <PhotoQualityModal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        onContinue={() => {
          setShowEducationModal(false);
          if (onOpenLiveCamera) {
            onOpenLiveCamera();
          }
        }}
      />

      {/* Bottom Sheet de Calidad de Toma */}
      <MobileBottomSheet
        isOpen={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
        title="Calidad de Toma y Encuadre"
        subtitle={`${nombre_plato || "Plato analizado"} • ${currentCalories} kcal`}
      >
        <div className="space-y-4 py-1">
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800">Calibración Espacial</span>
              <span className="text-[10px] font-mono font-bold text-fitia-dark bg-fitia-yellow px-2 py-0.5 rounded-lg">
                Ref: 25 cm Ø
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-neutral-200">
                {control_calidad?.alimento_dentro_del_marco ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="text-[11px] font-semibold text-neutral-800">
                  {control_calidad?.alimento_dentro_del_marco ? "Centrado en marco" : "Fuera de marco"}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-neutral-200">
                {control_calidad?.ingredientes_visibles ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-[11px] font-semibold text-neutral-800">
                  {control_calidad?.ingredientes_visibles ? "Ingredientes claros" : "Foto difusa"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
                <Scale className="w-4 h-4 text-neutral-600" />
                Volumen tridimensional estimado:
              </span>
              <span className="font-mono font-bold text-neutral-900">
                ~{control_calidad?.volumen_estimado_cm3 || Math.round(baseWeight / 1.05)} cm³
              </span>
            </div>
          </div>

          <FitiaButton
            type="button"
            onClick={() => setShowDetailSheet(false)}
          >
            Cerrar Desglose
          </FitiaButton>
        </div>
      </MobileBottomSheet>

      {/* Modal de Doble Toma Estereoscópica 3D */}
      <DualAngleCaptureModal
        isOpen={showDualAngleModal}
        onClose={() => setShowDualAngleModal(false)}
        onCompleteCapture={(top, side) => {
          setPreviewImage(top);
          onScanImage(top, "image/jpeg");
        }}
      />
    </div>
  );
};
