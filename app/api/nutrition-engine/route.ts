import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { SYSTEM_PROMPT, sanitizeAndNormalizeOutput } from "@/lib/nutrition-engine-service";
import {
  getMockScanFood,
  getMockLogDiary,
  getMockCalculateTargets,
  getMockMealPlanner,
  getMockGroceryList,
  getMockCoachAdvice,
} from "@/lib/mock-fallbacks";
import { AccionEjecutada } from "@/types/nutrition";

export async function POST(req: NextRequest) {
  let targetAction: AccionEjecutada = "SCAN_FOOD";
  let inputText: string | undefined;
  let imageBase64: string | undefined;
  let imageMimeType: string | undefined;
  let audioBase64: string | undefined;
  let audioMimeType: string | undefined;
  let userData: any;
  let mealPlanPreferences: any;
  let existingMealPlan: any;

  try {
    const body = await req.json();
    const {
      action,
      inputText: inText,
      imageBase64: inImg,
      imageMimeType: inImgMime,
      audioBase64: inAudio,
      audioMimeType: inAudioMime,
      userData: inUser,
      mealPlanPreferences: inMealPrefs,
      existingMealPlan: inPlan,
      userHint: inUserHint,
    } = body;

    let userHint: string | undefined = inUserHint;
    inputText = inText;
    imageBase64 = inImg;
    imageMimeType = inImgMime;
    audioBase64 = inAudio;
    audioMimeType = inAudioMime;
    userData = inUser;
    mealPlanPreferences = inMealPrefs;
    existingMealPlan = inPlan;
    targetAction = action;

    // Detect action if not specified
    if (!targetAction) {
      if (imageBase64) {
        targetAction = "SCAN_FOOD";
      } else if (audioBase64) {
        targetAction = "LOG_DIARY_TEXT_OR_VOICE";
      } else if (userData && (userData.peso_actual_kg || userData.altura_cm)) {
        targetAction = "CALCULATE_TARGETS_AND_TIMELINE";
      } else if (existingMealPlan && !mealPlanPreferences) {
        targetAction = "SMART_GROCERY_LIST";
      } else if (mealPlanPreferences || (inputText && inputText.toLowerCase().includes("plan"))) {
        targetAction = "MEAL_PLANNER";
      } else if (
        inputText &&
        (inputText.toLowerCase().includes("comí") ||
          inputText.toLowerCase().includes("desayuné") ||
          inputText.toLowerCase().includes("cené") ||
          inputText.toLowerCase().includes("almorcé") ||
          inputText.toLowerCase().includes("gramos de"))
      ) {
        targetAction = "LOG_DIARY_TEXT_OR_VOICE";
      } else {
        targetAction = "COACH_ADVICE";
      }
    }

    const ai = getGeminiClient();

    // If no Gemini API key is configured, return the high-fidelity mock fallback
    if (!ai) {
      console.warn("GEMINI_API_KEY no detectada. Retornando respuesta estricta simulada.");
      let fallbackData;
      switch (targetAction) {
        case "SCAN_FOOD":
          fallbackData = getMockScanFood();
          break;
        case "LOG_DIARY_TEXT_OR_VOICE":
          fallbackData = getMockLogDiary(inputText);
          break;
        case "CALCULATE_TARGETS_AND_TIMELINE":
          fallbackData = getMockCalculateTargets(userData);
          break;
        case "MEAL_PLANNER":
          fallbackData = getMockMealPlanner(mealPlanPreferences?.caloriasObjetivo);
          break;
        case "SMART_GROCERY_LIST":
          fallbackData = getMockGroceryList();
          break;
        case "COACH_ADVICE":
        default:
          fallbackData = getMockCoachAdvice(inputText);
          break;
      }
      return NextResponse.json(fallbackData, {
        headers: { "X-Engine-Source": "simulation-fallback" },
      });
    }

    // Build contents array for Gemini
    const parts: any[] = [];

    // If image provided
    if (imageBase64) {
      const cleanData = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: cleanData,
        },
      });
    }

    // If audio provided
    if (audioBase64) {
      const cleanAudio = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.+]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: audioMimeType || "audio/webm",
          data: cleanAudio,
        },
      });
    }

    // Build textual instruction contextualizing the user request and desired action
    let instructionText = `Solicitud del usuario para el motor de nutrición:
Acción solicitada o detectada: "${targetAction}"
`;

    if (inputText) {
      instructionText += `Texto o consulta del usuario: "${inputText}"\n`;
    }

    if (userHint) {
      instructionText += `Pista o nota explícita del usuario sobre el alimento o plato: "${userHint}" (prioriza esta pista para identificar el plato con máxima exactitud)\n`;
    }

    if (userData) {
      instructionText += `Datos antropométricos del usuario:
- Edad: ${userData.edad || "N/A"} años
- Género: ${userData.genero || "N/A"}
- Altura: ${userData.altura_cm || "N/A"} cm
- Peso actual: ${userData.peso_actual_kg || "N/A"} kg
- Nivel de actividad: ${userData.nivel_actividad || "N/A"}
- Peso objetivo: ${userData.peso_meta_kg || "N/A"} kg
`;
    }

    if (mealPlanPreferences) {
      instructionText += `Preferencias para el plan de comidas: ${JSON.stringify(mealPlanPreferences)}\n`;
    }

    if (existingMealPlan) {
      instructionText += `Plan de comidas existente para extraer la lista de compras: ${JSON.stringify(
        existingMealPlan
      )}\n`;
    }

    instructionText += `\nGenera ÚNICA Y EXCLUSIVAMENTE el JSON estructurado solicitado para la acción "${targetAction}".`;

    parts.push({ text: instructionText });

    const candidateModels: string[] = [
      process.env.GEMINI_MODEL,
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-lite-latest",
    ].filter((m): m is string => Boolean(m));

    let response: any = null;
    let modelUsed = "gemini-flash-latest";
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
          },
        });
        if (response && response.text) {
          modelUsed = model;
          break;
        }
      } catch (err: any) {
        console.warn(`[NutriEngine] Modelo ${model} no disponible (${err?.status || err?.message || err}). Probando siguiente...`);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("No se pudo obtener respuesta de ningún modelo de IA activo.");
    }

    const responseText = response.text || "{}";
    let parsed: any;
    try {
      // In case there is backtick formatting
      const cleaned = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Error al parsear JSON devuelto por Gemini:", parseErr, responseText);
      parsed = null;
    }

    if (!parsed) {
      // Fallback if parsing failed
      switch (targetAction) {
        case "SCAN_FOOD":
          return NextResponse.json(getMockScanFood());
        case "LOG_DIARY_TEXT_OR_VOICE":
          return NextResponse.json(getMockLogDiary(inputText));
        case "CALCULATE_TARGETS_AND_TIMELINE":
          return NextResponse.json(getMockCalculateTargets(userData));
        case "MEAL_PLANNER":
          return NextResponse.json(getMockMealPlanner(mealPlanPreferences?.caloriasObjetivo));
        case "SMART_GROCERY_LIST":
          return NextResponse.json(getMockGroceryList());
        case "COACH_ADVICE":
        default:
          return NextResponse.json(getMockCoachAdvice(inputText));
      }
    }

    const normalized = sanitizeAndNormalizeOutput(parsed, targetAction);
    return NextResponse.json(normalized, {
      headers: { "X-Engine-Source": modelUsed },
    });
  } catch (error: any) {
    console.error("Error en API /api/nutrition-engine (aplicando fallback seguro por acción):", error?.message || error);
    let fallbackData;
    switch (targetAction) {
      case "SCAN_FOOD":
        fallbackData = getMockScanFood();
        break;
      case "LOG_DIARY_TEXT_OR_VOICE":
        fallbackData = getMockLogDiary(inputText);
        break;
      case "CALCULATE_TARGETS_AND_TIMELINE":
        fallbackData = getMockCalculateTargets(userData);
        break;
      case "MEAL_PLANNER":
        fallbackData = getMockMealPlanner(mealPlanPreferences?.caloriasObjetivo);
        break;
      case "SMART_GROCERY_LIST":
        fallbackData = getMockGroceryList();
        break;
      case "COACH_ADVICE":
      default:
        fallbackData = getMockCoachAdvice(inputText);
        break;
    }
    return NextResponse.json(fallbackData, {
      status: 200,
      headers: { "X-Engine-Fallback": "error-recovery", "X-Engine-Action": targetAction },
    });
  }
}
