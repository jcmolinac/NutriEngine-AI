"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { JsonInspector } from "@/components/JsonInspector";
import { ScanFoodTab } from "@/components/ScanFoodTab";
import { LogDiaryTab } from "@/components/LogDiaryTab";
import { CalculateTargetsTab } from "@/components/CalculateTargetsTab";
import { MealPlannerTab } from "@/components/MealPlannerTab";
import { SmartGroceryListTab } from "@/components/SmartGroceryListTab";
import { CoachAdviceTab } from "@/components/CoachAdviceTab";
import { MobileCameraViewfinder } from "@/components/MobileCameraViewfinder";
import { BottomNav } from "@/components/BottomNav";
import {
  NutriEngineOutput,
  AccionEjecutada,
  UserAntropoData,
  PlanComidas,
  ItemDiario,
  EscaneoComida,
} from "@/types/nutrition";
import { AuthModal } from "@/components/AuthModal";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadUserDataFromCloud } from "@/lib/supabase/sync-service";
import {
  getMockScanFood,
  getMockLogDiary,
  getMockCalculateTargets,
  getMockMealPlanner,
  getMockGroceryList,
  getMockCoachAdvice,
} from "@/lib/mock-fallbacks";
import { getEmptyNutriOutput } from "@/lib/nutrition-engine-service";
import {
  generateWeeklyPlanFromIngredients,
  DEFAULT_SELECTED_INGREDIENTS,
} from "@/lib/meal-planner-generator";

function createCleanInitialState(): NutriEngineOutput {
  const empty = getEmptyNutriOutput("CALCULATE_TARGETS_AND_TIMELINE");

  return {
    accion_ejecutada: "CALCULATE_TARGETS_AND_TIMELINE",
    escaneo_comida: empty.escaneo_comida,
    registro_diario: empty.registro_diario,
    metas_y_progreso: {
      tasa_metabolica_basal_bmr: 0,
      gasto_energetico_total_tdee: 0,
      calorias_diarias_recomendadas: 0,
      rango_calorico: { min: 0, max: 0 },
      macros_objetivo: { proteinas_g: 0, carbohidratos_g: 0, grasas_g: 0 },
      curva_progreso: [],
    },
    plan_comidas: { dias: [] },
    lista_compras: [],
    modulo_coach: empty.modulo_coach,
    perfil_usuario: {
      edad: 30,
      genero: "masculino",
      peso_actual_kg: 75,
      altura_cm: 175,
      nivel_actividad: "moderado",
      peso_meta_kg: 70,
    },
    registro_agua: {
      meta_ml: 2000,
      consumido_ml: 0,
      vasos_registrados: [],
    },
    estado_ayuno: {
      protocolo: "16:8",
      hora_inicio_ayuno: "20:00",
      horas_ayuno: 16,
      hora_fin_ventana: "20:00",
      en_ayuno: false,
    },
    historial_dias: {},
  };
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AccionEjecutada>("LOG_DIARY_TEXT_OR_VOICE");
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [engineState, setEngineState] = useState<NutriEngineOutput>(createCleanInitialState);
  const getTodayLocalIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocalIso);

  const STORAGE_KEY = "nutriengine_pwa_v6_clean";
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    nombre?: string;
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Escuchar sesión de Supabase si está disponible
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || "",
          nombre: session.user.user_metadata?.nombre || session.user.email?.split("@")[0],
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || "",
          nombre: session.user.user_metadata?.nombre || session.user.email?.split("@")[0],
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Restaurar estado persistido en cliente tras montaje seguro y purgar claves de prueba
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // Purgar datos de prueba previos y versiones anteriores
        localStorage.removeItem("nutriengine_pwa_v5_clean");
        localStorage.removeItem("nutriengine_pwa_v4_advanced");
        localStorage.removeItem("nutriengine_state_v3");
        localStorage.removeItem("nutriengine_state_v2");
        localStorage.removeItem("nutriengine_state_v1");

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            // Si el estado almacenado tiene 1817 kcal pero no tiene perfil de usuario real, purgar metas a 0
            if (
              parsed.metas_y_progreso?.calorias_diarias_recomendadas === 1817 &&
              !parsed.perfil_usuario?.edad
            ) {
              parsed.metas_y_progreso = createCleanInitialState().metas_y_progreso;
            }
            setEngineState((prev) => ({
              ...prev,
              ...parsed,
            }));
          }
        }
      }
    } catch (e) {
      console.warn("Error restaurando estado desde localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Guardar estado reactivamente al cambiar (únicamente tras hidratar)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(engineState));
      }
    } catch (e) {
      console.warn("Error guardando estado en localStorage", e);
    }
  }, [engineState, isHydrated]);

  const handleResetState = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("nutriengine_pwa_v5_clean");
        localStorage.removeItem("nutriengine_pwa_v4_advanced");
      }
    } catch (e) {
      console.warn(e);
    }
    setEngineState(createCleanInitialState());
    setCapturedImage(null);
    setErrorMessage("Aplicación restablecida a estado limpio.");
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Error cerrando sesión:", err);
    }
    setCurrentUser(null);
    handleResetState();
    setErrorMessage("Sesión cerrada. La aplicación se restableció a modo invitado limpio.");
  };

  const handleAuthSuccess = async (user: { id: string; email: string; nombre?: string }) => {
    setCurrentUser(user);
    setErrorMessage(null);
    try {
      const cloudData = await loadUserDataFromCloud(user.id);
      if (cloudData) {
        setEngineState((prev) => ({
          ...prev,
          ...cloudData,
        }));
      }
    } catch (err) {
      console.warn("No se cargaron datos remotos:", err);
    }
  };

  const callNutritionEngine = async (payload: any, targetAction: AccionEjecutada) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/nutrition-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, action: targetAction }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.status}`);
      }

      const data: NutriEngineOutput = await res.json();

      if (
        data.escaneo_comida?.nombre_plato === "Alimento no detectado" ||
        data.escaneo_comida?.nombre_plato === "No se pudo identificar el alimento"
      ) {
        setErrorMessage(
          data.escaneo_comida?.control_calidad?.advertencia_precision ||
            "No se detectó un alimento claro. Por favor enfoca de nuevo tu plato o bebida con buena luz."
        );
      }

      setEngineState((prev) => ({
        ...prev,
        accion_ejecutada: data.accion_ejecutada || targetAction,
        escaneo_comida:
          data.escaneo_comida?.nombre_plato != null
            ? data.escaneo_comida
            : prev.escaneo_comida,
        registro_diario:
          data.registro_diario?.items_reconocidos?.length > 0
            ? data.registro_diario
            : prev.registro_diario,
        metas_y_progreso:
          data.metas_y_progreso?.calorias_diarias_recomendadas > 0
            ? data.metas_y_progreso
            : prev.metas_y_progreso,
        plan_comidas:
          data.plan_comidas?.dias?.length > 0 ? data.plan_comidas : prev.plan_comidas,
        lista_compras:
          data.lista_compras?.length > 0 ? data.lista_compras : prev.lista_compras,
        modulo_coach:
          data.modulo_coach?.respuesta_consulta ? data.modulo_coach : prev.modulo_coach,
      }));
    } catch (err: any) {
      console.error("Error llamando al motor de nutrición:", err);
      setErrorMessage("Conexión local estructurada aplicada.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handlers for the 6 actions
  const handleScanImage = async (base64: string, mimeType: string, userHint?: string) => {
    setActiveTab("SCAN_FOOD");
    // Limpiar inmediatamente el plato previo para evitar mostrar datos antiguos durante el análisis
    setEngineState((prev) => ({
      ...prev,
      escaneo_comida: getEmptyNutriOutput("SCAN_FOOD").escaneo_comida,
    }));
    await callNutritionEngine(
      {
        imageBase64: base64,
        imageMimeType: mimeType,
        userHint,
      },
      "SCAN_FOOD"
    );
  };

  const handleCameraCapture = (base64: string, userHint?: string) => {
    setCapturedImage(base64);
    setActiveTab("SCAN_FOOD");
    handleScanImage(base64, "image/jpeg", userHint);
  };

  const handleUpdateEscaneoData = (updated: EscaneoComida) => {
    setEngineState((prev) => ({
      ...prev,
      escaneo_comida: updated,
    }));
  };

  const handleLogTextOrVoice = async (params: {
    text?: string;
    audioBase64?: string;
    audioMimeType?: string;
  }) => {
    setActiveTab("LOG_DIARY_TEXT_OR_VOICE");
    await callNutritionEngine(
      {
        inputText: params.text,
        audioBase64: params.audioBase64,
        audioMimeType: params.audioMimeType,
      },
      "LOG_DIARY_TEXT_OR_VOICE"
    );
  };

  const handleAddWater = (ml: number) => {
    const horaActual = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setEngineState((prev) => {
      const prevAgua = prev.registro_agua || {
        meta_ml: 3325,
        consumido_ml: 0,
        vasos_registrados: [],
      };
      const nuevoConsumido = Math.max(0, prevAgua.consumido_ml + ml);
      const nuevosVasos =
        ml > 0
          ? [...(prevAgua.vasos_registrados || []), { hora: horaActual, ml }]
          : (prevAgua.vasos_registrados || []).slice(0, -1);

      return {
        ...prev,
        registro_agua: {
          ...prevAgua,
          consumido_ml: nuevoConsumido,
          vasos_registrados: nuevosVasos,
        },
      };
    });
  };

  const handleAddDirectItem = (
    item: {
      nombre: string;
      peso_g: number;
      calorias: number;
      proteinas_g: number;
      carbohidratos_g: number;
      grasas_g: number;
      fibra_g?: number;
      sodio_mg?: number;
    },
    mealTime: "Desayuno" | "Comida" | "Cena" | "Snack"
  ) => {
    const newItem: ItemDiario = {
      alimento: item.nombre,
      porcion_estimada: `${item.peso_g}g`,
      peso_g: item.peso_g,
      calorias: item.calorias,
      proteinas_g: item.proteinas_g,
      carbohidratos_g: item.carbohidratos_g,
      grasas_g: item.grasas_g,
      fibra_g: item.fibra_g,
      sodio_mg: item.sodio_mg,
    };

    setEngineState((prev) => {
      const currentItems = prev.registro_diario?.items_reconocidos || [];
      const updatedItems = [...currentItems, newItem];
      const totalCal = updatedItems.reduce((acc, it) => acc + (it.calorias || 0), 0);

      return {
        ...prev,
        registro_diario: {
          ...prev.registro_diario,
          tiempo_comida: mealTime,
          items_reconocidos: updatedItems,
          total_calorias: totalCal,
        },
      };
    });
  };

  const handleDeleteDirectItem = (
    sectionId: "desayuno" | "comida" | "cena",
    itemIndex: number,
    item: any
  ) => {
    setEngineState((prev) => {
      const items = prev.registro_diario?.items_reconocidos || [];
      const matchIdx = items.findIndex(
        (it) => it.alimento === item.nombre && it.calorias === item.calorias
      );
      const updatedItems =
        matchIdx >= 0 ? items.filter((_, idx) => idx !== matchIdx) : items;
      const totalCal = updatedItems.reduce((acc, it) => acc + (it.calorias || 0), 0);

      return {
        ...prev,
        registro_diario: {
          ...prev.registro_diario,
          items_reconocidos: updatedItems,
          total_calorias: totalCal,
        },
      };
    });
  };

  const handleUpdateDirectItem = (
    sectionId: "desayuno" | "comida" | "cena",
    itemIndex: number,
    updated: any
  ) => {
    setEngineState((prev) => {
      const items = [...(prev.registro_diario?.items_reconocidos || [])];
      const matchIdx = items.findIndex((it, idx) => {
        if (updated.id && (it as any).id === updated.id) return true;
        return it.alimento === updated.nombre || idx === itemIndex;
      });

      if (matchIdx >= 0) {
        items[matchIdx] = {
          ...items[matchIdx],
          alimento: updated.nombre,
          peso_g: updated.peso_g,
          porcion_estimada: `${updated.peso_g} g`,
          calorias: updated.calorias,
          proteinas_g: updated.proteinas_g,
          carbohidratos_g: updated.carbohidratos_g,
          grasas_g: updated.grasas_g,
          fibra_g: updated.fibra_g,
          sodio_mg: updated.sodio_mg,
          fuente_verificada: updated.fuente_verificada,
        };
      }
      const totalCal = items.reduce((acc, it) => acc + (it.calorias || 0), 0);
      return {
        ...prev,
        registro_diario: {
          ...prev.registro_diario,
          items_reconocidos: items,
          total_calorias: totalCal,
        },
      };
    });
  };

  const handleCalculateTargets = async (userData: UserAntropoData) => {
    setActiveTab("CALCULATE_TARGETS_AND_TIMELINE");
    // Cálculo optimista inmediato para respuesta instantánea de UI
    const immediateData = getMockCalculateTargets(userData);
    if (immediateData.metas_y_progreso) {
      const targetWaterMl = Math.round((userData.peso_actual_kg || 75) * 35);
      setEngineState((prev) => ({
        ...prev,
        accion_ejecutada: "CALCULATE_TARGETS_AND_TIMELINE",
        perfil_usuario: userData,
        metas_y_progreso: immediateData.metas_y_progreso,
        registro_agua: {
          meta_ml: targetWaterMl,
          consumido_ml: prev.registro_agua?.consumido_ml || 0,
          vasos_registrados: prev.registro_agua?.vasos_registrados || [],
        },
      }));
    }
    await callNutritionEngine({ userData }, "CALCULATE_TARGETS_AND_TIMELINE");
  };

  const handleGeneratePlan = async (calorieTarget?: number, selectedFoods?: string[]) => {
    setActiveTab("MEAL_PLANNER");
    const targetKcal = calorieTarget && calorieTarget > 1000 ? calorieTarget : 1800;
    // Generación inmediata con los alimentos seleccionados por el usuario
    const { plan, groceryList } = generateWeeklyPlanFromIngredients(
      selectedFoods && selectedFoods.length > 0 ? selectedFoods : DEFAULT_SELECTED_INGREDIENTS,
      targetKcal
    );
    setEngineState((prev) => ({
      ...prev,
      accion_ejecutada: "MEAL_PLANNER",
      plan_comidas: plan,
      lista_compras: groceryList,
    }));
  };

  const handleGenerateGroceryListFromPlan = async (plan: PlanComidas) => {
    setActiveTab("SMART_GROCERY_LIST");
    await callNutritionEngine(
      {
        existingMealPlan: plan,
      },
      "SMART_GROCERY_LIST"
    );
  };

  const handleRefreshGroceryList = async () => {
    setActiveTab("SMART_GROCERY_LIST");
    await callNutritionEngine(
      {
        existingMealPlan: engineState.plan_comidas,
      },
      "SMART_GROCERY_LIST"
    );
  };

  const handleAskCoach = async (query: string) => {
    setActiveTab("COACH_ADVICE");
    await callNutritionEngine(
      {
        inputText: query,
      },
      "COACH_ADVICE"
    );
  };

  return (
    <div className="w-full h-dvh min-h-dvh bg-stone-950 flex items-center justify-center overflow-hidden select-none">
      {/* 100% Mobile-Only Smartphone Frame Viewport */}
      <div
        id="nutriengine-mobile-viewport"
        className="max-w-md mx-auto w-full min-h-dvh h-dvh overflow-hidden flex flex-col relative bg-fitia-cream sm:rounded-[38px] sm:shadow-2xl sm:border-[8px] sm:border-stone-800"
      >
        {/* Top Navbar & Header with Safe Area Top */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showJsonDrawer={showJsonDrawer}
          setShowJsonDrawer={setShowJsonDrawer}
          isProcessing={isProcessing}
          onOpenLiveCamera={() => setIsCameraOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable Mobile Content Viewport with Safe Area Bottom Padding for Nav */}
        <main
          id="mobile-main-scroll"
          className="flex-1 overflow-y-auto overscroll-y-none mobile-scroll px-3 pt-3 pb-safe-nav text-stone-900"
        >
          {errorMessage && (
            <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-amber-700 hover:text-amber-900 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tab Views */}
          {activeTab === "SCAN_FOOD" && (
            <ScanFoodTab
              escaneoData={engineState.escaneo_comida}
              onScanImage={handleScanImage}
              isProcessing={isProcessing}
              onOpenLiveCamera={() => setIsCameraOpen(true)}
              externalCapturedImage={capturedImage}
              onUpdateEscaneoData={handleUpdateEscaneoData}
            />
          )}

          {activeTab === "LOG_DIARY_TEXT_OR_VOICE" && (
            <LogDiaryTab
              registroData={engineState.registro_diario}
              metasData={engineState.metas_y_progreso}
              registroAgua={engineState.registro_agua}
              onAddWater={handleAddWater}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onAddDirectItem={handleAddDirectItem}
              onDeleteDirectItem={handleDeleteDirectItem}
              onUpdateDirectItem={handleUpdateDirectItem}
              onLogTextOrVoice={handleLogTextOrVoice}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === "CALCULATE_TARGETS_AND_TIMELINE" && (
            <CalculateTargetsTab
              metasData={engineState.metas_y_progreso}
              perfilUsuario={engineState.perfil_usuario}
              onCalculateTargets={handleCalculateTargets}
              onResetTargets={handleResetState}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === "MEAL_PLANNER" && (
            <MealPlannerTab
              planData={engineState.plan_comidas}
              groceryData={engineState.lista_compras}
              onGeneratePlan={handleGeneratePlan}
              onGenerateGroceryListFromPlan={handleGenerateGroceryListFromPlan}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === "SMART_GROCERY_LIST" && (
            <SmartGroceryListTab
              groceryData={engineState.lista_compras}
              onRefreshList={handleRefreshGroceryList}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === "COACH_ADVICE" && (
            <CoachAdviceTab
              coachData={engineState.modulo_coach}
              onAskCoach={handleAskCoach}
              isProcessing={isProcessing}
            />
          )}
        </main>

        {/* Fixed Fitia Bottom Navigation with Central Shutter Trigger */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenScanner={() => setIsCameraOpen(true)}
        />

        {/* Live Rear Camera Viewfinder (Full Screen Environment Sensor Modal) */}
        <MobileCameraViewfinder
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />

        {/* JSON Inspector Bottom Sheet */}
        <JsonInspector
          data={engineState}
          isOpen={showJsonDrawer}
          onClose={() => setShowJsonDrawer(false)}
          onResetData={handleResetState}
        />

        {/* Auth Modal Bottom Sheet */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
}
