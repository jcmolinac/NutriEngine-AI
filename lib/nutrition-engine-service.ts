import { NutriEngineOutput, AccionEjecutada } from "@/types/nutrition";
import { getGeminiClient } from "./gemini";

export const SYSTEM_PROMPT = `Eres el motor integral de inteligencia artificial para una aplicación de nutrición, conteo calórico y planificación de comidas. Tu trabajo consiste en procesar imágenes de platos, entradas de audio/voz, textos y datos antropométricos para generar respuestas estructuradas en formato JSON.

----------------------------------------------------------------------
REGLAS DE PRECISIÓN VOLUMÉTRICA Y GRASAS (OBLIGATORIAS EN SCAN_FOOD):
1. Escala y volumen: Usa como referencia estándar un plato llano de 25 cm de diámetro. Evalúa la altura y volumen en cm³ (no solo el área plana) y calcula según densidades de alimentos cocinados (ej. arroz cocido ~130 kcal/100g, pollo asado ~165 kcal/100g).
2. Grasas ocultas: Si la comida presenta brillo o aspecto salteado/plancha/horno, añade obligatoriamente una línea de "aceite de cocción" (7-10 g / 60-90 kcal) salvo que se indique cocción al vapor o sin grasa.
3. Coherencia matemática: Verifica que Calorías = (Proteínas × 4) + (Carbohidratos × 4) + (Grasas × 9) y que la suma porcentual dé exactamente 100% (porcentaje_proteinas + porcentaje_carbohidratos + porcentaje_grasas = 100.0%).
----------------------------------------------------------------------

Dependiendo de la entrada que recibas, debes determinar y ejecutar automáticamente una de las siguientes 6 ACCIONES:

----------------------------------------------------------------------
ACCIONES DEL SISTEMA:

1. ACCIÓN: "SCAN_FOOD" (Cuando recibes una imagen de comida o un plato)
   - Calidad de toma: Evalúa si el alimento está dentro del marco (alimento_dentro_del_marco: true/false) y si los componentes son visibles (ingredientes_visibles: true/false). Si la foto está muy cerca o borrosa, genera una advertencia de precisión.
   - Segmentación e ingredientes: Identifica cada ingrediente por separado, estima su peso en gramos preparados evaluando la altura y volumen tridimensional en cm³ con referencia de plato de 25 cm, y calcula sus calorías, proteínas, carbohidratos y grasas.
   - Grasas ocultas: Si presenta aspecto a la plancha, salteado u horneado con brillo, añade obligatoriamente la línea de "aceite de cocción" (7-10g / 60-90 kcal).
   - Coherencia matemática estricta: Totaliza el peso en gramos preparados, verifica que Calorías = (Proteínas × 4) + (Carbohidratos × 4) + (Grasas × 9) y que la suma de porcentajes dé exactamente 100%.
   - Consejo del Coach: Incluye un análisis breve del plato (calidad proteica, fibra o sugerencia de ajuste).

2. ACCIÓN: "LOG_DIARY_TEXT_OR_VOICE" (Cuando el usuario escribe o dicta lo que comió)
   - Transforma entradas informales (ej. "me comí dos huevos revueltos con una rebanada de pan y un café con leche") en un registro estructurado asignado al tiempo de comida correspondiente (Desayuno, Comida, Cena o Snack).
   - Realiza estimaciones realistas de porciones estándar si el usuario no especifica pesos.

3. ACCIÓN: "CALCULATE_TARGETS_AND_TIMELINE" (Cuando recibes datos del usuario: edad, peso, altura, género, actividad y peso meta)
   - Calcula Tasa Metabólica Basal (BMR) y Gasto Energético Total Diario (TDEE).
   - Asigna presupuesto calórico con rango (mínimo y máximo) y macronutrientes meta en gramos (proteínas, carbohidratos, grasas).
   - Genera una proyección de progreso semanal: desde el peso actual en la fecha de inicio hasta la fecha estimada de llegada al peso objetivo, incluyendo hitos intermedios.

4. ACCIÓN: "MEAL_PLANNER" (Cuando se solicita plan semanal o selección de recetas)
   - Genera o selecciona recetas para cada tiempo de comida (Desayuno, Comida, Cena).
   - Cada receta debe indicar: nombre, tiempo de preparación en minutos, ingredientes con gramos y desglose de macros que encaje en el presupuesto diario del usuario.
   - Si se solicita para la semana, distribuye los días (Lunes a Domingo) con rotación equilibrada.

5. ACCIÓN: "SMART_GROCERY_LIST" (Cuando se solicita la lista de la compra del plan)
   - Consolida y suma todos los ingredientes del plan semanal.
   - Agrúpalos por categoría de supermercado: Verduras y Frutas, Carnicería/Pescadería, Despensa y Granos, Lácteos, etc.

6. ACCIÓN: "COACH_ADVICE" (Consultas generales de nutrición, dudas de alimentos o ayuno)
   - Ofrece pautas clínicas y prácticas de nutrición, recomendaciones de protocolo de ayuno intermitente (ej. 16/8) y consejos de hábitos saludables.

----------------------------------------------------------------------
REGLA ESTRICTA DE SALIDA:
Responde ÚNICA Y EXCLUSIVAMENTE con el siguiente objeto JSON válido, sin bloques explicativos adicionales ni formato Markdown alrededor:

{
  "accion_ejecutada": "SCAN_FOOD | LOG_DIARY_TEXT_OR_VOICE | CALCULATE_TARGETS_AND_TIMELINE | MEAL_PLANNER | SMART_GROCERY_LIST | COACH_ADVICE",
  
  "escaneo_comida": {
    "nombre_plato": "string o null",
    "peso_total_preparado_g": 0,
    "peso_g": 0.0,
    "calorias_totales": 0,
    "metodo_coccion_inferido": "string (ej. asado, plancha, hervido, frito)",
    "puntuacion_confianza": 0.95,
    "micro_preguntas_confirmacion": [
      "string (ej. ¿Se utilizó aceite de oliva al cocinar el pollo?)"
    ],
    "macronutrientes": {
      "proteinas_g": 0.0,
      "carbohidratos_g": 0.0,
      "grasas_g": 0.0,
      "porcentaje_proteinas": 0.0,
      "porcentaje_carbohidratos": 0.0,
      "porcentaje_grasas": 0.0
    },
    "ingredientes": [
      {
        "alimento": "string",
        "peso_estimado_g": 0.0,
        "peso_g": 0.0,
        "calorias": 0,
        "proteinas_g": 0.0,
        "carbohidratos_g": 0.0,
        "grasas_g": 0.0
      }
    ],
    "control_calidad": {
      "alimento_dentro_del_marco": true,
      "ingredientes_visibles": true,
      "advertencia_precision": "string o null"
    },
    "consejo_coach": "string o null"
  },

  "registro_diario": {
    "tiempo_comida": "Desayuno | Comida | Cena | Snack | null",
    "descripcion_original": "string o null",
    "items_reconocidos": [
      {
        "alimento": "string",
        "porcion_estimada": "string",
        "calorias": 0,
        "proteinas_g": 0.0,
        "carbohidratos_g": 0.0,
        "grasas_g": 0.0
      }
    ],
    "total_calorias": 0
  },

  "metas_y_progreso": {
    "tasa_metabolica_basal_bmr": 0,
    "gasto_energetico_total_tdee": 0,
    "calorias_diarias_recomendadas": 0,
    "rango_calorico": { "min": 0, "max": 0 },
    "macros_objetivo": {
      "proteinas_g": 0,
      "carbohidratos_g": 0,
      "grasas_g": 0
    },
    "curva_progreso": [
      {
        "etiqueta": "string (ej. Hoy, Semana 4, Objetivo Final)",
        "fecha_estimada": "YYYY-MM-DD",
        "peso_proyectado_kg": 0.0
      }
    ]
  },

  "plan_comidas": {
    "dias": [
      {
        "dia": "Lunes | Martes | Miercoles | Jueves | Viernes | Sabado | Domingo",
        "resumen_dia": { "calorias": 0, "proteinas_g": 0, "carbs_g": 0, "grasas_g": 0 },
        "comidas": [
          {
            "tipo": "Desayuno | Almuerzo | Cena",
            "nombre_receta": "string",
            "tiempo_preparacion_min": 0,
            "calorias": 0,
            "proteinas_g": 0.0,
            "carbs_g": 0.0,
            "grasas_g": 0.0
          }
        ]
      }
    ]
  },

  "lista_compras": [
    {
      "categoria": "string",
      "items": [
        { "alimento": "string", "cantidad_total": "string" }
      ]
    }
  ],

  "modulo_coach": {
    "respuesta_consulta": "string o null",
    "sugerencia_ayuno": {
      "protocolo": "string (ej. 16:8)",
      "ventana_ingesta": "string (ej. 12:00 PM - 8:00 PM)",
      "recomendacion": "string"
    }
  }
}`;

export function getEmptyNutriOutput(accion: AccionEjecutada): NutriEngineOutput {
  return {
    accion_ejecutada: accion,
    escaneo_comida: {
      nombre_plato: null,
      peso_total_preparado_g: 0,
      peso_g: 0,
      calorias_totales: 0,
      metodo_coccion_inferido: "plancha",
      puntuacion_confianza: 0.95,
      micro_preguntas_confirmacion: [],
      macronutrientes: {
        proteinas_g: 0,
        carbohidratos_g: 0,
        grasas_g: 0,
        porcentaje_proteinas: 0,
        porcentaje_carbohidratos: 0,
        porcentaje_grasas: 0,
      },
      ingredientes: [],
      control_calidad: {
        alimento_dentro_del_marco: true,
        ingredientes_visibles: true,
        advertencia_precision: null,
      },
      consejo_coach: null,
    },
    registro_diario: {
      tiempo_comida: null,
      descripcion_original: null,
      items_reconocidos: [],
      total_calorias: 0,
    },
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
    modulo_coach: {
      respuesta_consulta: null,
      sugerencia_ayuno: {
        protocolo: "16:8",
        ventana_ingesta: "12:00 PM - 8:00 PM",
        recomendacion: "Mantén buena hidratación con agua, café solo o té durante las horas de ayuno.",
      },
    },
  };
}

export function sanitizeAndNormalizeOutput(raw: any, fallbackAccion?: AccionEjecutada): NutriEngineOutput {
  const allowedActions: AccionEjecutada[] = [
    "SCAN_FOOD",
    "LOG_DIARY_TEXT_OR_VOICE",
    "CALCULATE_TARGETS_AND_TIMELINE",
    "MEAL_PLANNER",
    "SMART_GROCERY_LIST",
    "COACH_ADVICE",
  ];

  let accion = raw?.accion_ejecutada;
  if (!allowedActions.includes(accion)) {
    accion = fallbackAccion || "SCAN_FOOD";
  }

  const base = getEmptyNutriOutput(accion);

  // Escaneo comida
  if (raw?.escaneo_comida) {
    const esc = raw.escaneo_comida;
    base.escaneo_comida.nombre_plato = esc.nombre_plato || null;
    const totalWeight = Number(esc.peso_total_preparado_g) || Number(esc.peso_g) || 0;
    base.escaneo_comida.peso_total_preparado_g = totalWeight;
    base.escaneo_comida.peso_g = totalWeight;
    base.escaneo_comida.calorias_totales = Number(esc.calorias_totales) || 0;
    base.escaneo_comida.consejo_coach = esc.consejo_coach || null;
    base.escaneo_comida.metodo_coccion_inferido = esc.metodo_coccion_inferido || "plancha";
    base.escaneo_comida.puntuacion_confianza =
      typeof esc.puntuacion_confianza === "number" ? esc.puntuacion_confianza : 0.95;

    // micro_preguntas_confirmacion
    if (Array.isArray(esc.micro_preguntas_confirmacion) && esc.micro_preguntas_confirmacion.length > 0) {
      base.escaneo_comida.micro_preguntas_confirmacion = esc.micro_preguntas_confirmacion.map((q: any) => String(q));
    } else {
      base.escaneo_comida.micro_preguntas_confirmacion = [
        "¿Se utilizó aceite de oliva al cocinar el plato?",
        "¿El peso total de la ración se ajusta a lo que ves en tu plato?",
        "¿Se añadió sal, pan o salsa acompañante?",
      ];
    }

    if (esc.control_calidad) {
      base.escaneo_comida.control_calidad = {
        alimento_dentro_del_marco: esc.control_calidad.alimento_dentro_del_marco !== false,
        ingredientes_visibles: esc.control_calidad.ingredientes_visibles !== false,
        advertencia_precision: esc.control_calidad.advertencia_precision || null,
        referencia_plato_cm: 25,
        volumen_estimado_cm3: esc.control_calidad.volumen_estimado_cm3 || undefined,
        grasa_coccion_detectada: esc.control_calidad.grasa_coccion_detectada ?? undefined,
      };
    } else {
      base.escaneo_comida.control_calidad.referencia_plato_cm = 25;
    }

    if (Array.isArray(esc.ingredientes)) {
      base.escaneo_comida.ingredientes = esc.ingredientes.map((ing: any) => {
        const p_g = Number(ing.proteinas_g) || 0;
        const c_g = Number(ing.carbohidratos_g) || 0;
        const f_g = Number(ing.grasas_g) || 0;
        const weight = Number(ing.peso_estimado_g) || Number(ing.peso_g) || 0;
        // Strict ingredient mathematical coherence
        const cal = Math.round(p_g * 4 + c_g * 4 + f_g * 9) || Number(ing.calorias) || 0;
        return {
          alimento: String(ing.alimento || "Ingrediente"),
          peso_estimado_g: weight,
          peso_g: weight,
          calorias: cal,
          proteinas_g: p_g,
          carbohidratos_g: c_g,
          grasas_g: f_g,
        };
      });
    }

    // Regla 2: Grasas ocultas
    // Solo aplicar si el método de cocción es caliente (plancha, salteado, horno, asado, frito)
    // y no en alimentos crudos, frutas, licuados, avena o cocidos al vapor/agua.
    const hasOil = base.escaneo_comida.ingredientes.some((ing) => {
      const name = ing.alimento.toLowerCase();
      return name.includes("aceite") || name.includes("oliva") || name.includes("mantequilla") || name.includes("cooking oil");
    });

    const cookingMethod = (base.escaneo_comida.metodo_coccion_inferido || "").toLowerCase();
    const isWarmCooked =
      cookingMethod.includes("plancha") ||
      cookingMethod.includes("saltead") ||
      cookingMethod.includes("horn") ||
      cookingMethod.includes("asad") ||
      cookingMethod.includes("frit");

    const dishDesc = `${base.escaneo_comida.nombre_plato || ""} ${esc.consejo_coach || ""}`.toLowerCase();
    const isRawOrColdOrExempt =
      dishDesc.includes("fruta") ||
      dishDesc.includes("yogur") ||
      dishDesc.includes("avena") ||
      dishDesc.includes("porridge") ||
      dishDesc.includes("smoothie") ||
      dishDesc.includes("batido") ||
      dishDesc.includes("crudo") ||
      dishDesc.includes("ensalada fresca") ||
      dishDesc.includes("vapor") ||
      dishDesc.includes("sin grasa") ||
      dishDesc.includes("hervido al natural");

    if (!hasOil && isWarmCooked && !isRawOrColdOrExempt && base.escaneo_comida.ingredientes.length > 0) {
      base.escaneo_comida.ingredientes.push({
        alimento: "Aceite de cocción (salteado/plancha/horno)",
        peso_estimado_g: 8,
        peso_g: 8,
        calorias: 72,
        proteinas_g: 0,
        carbohidratos_g: 0,
        grasas_g: 8,
      });
      base.escaneo_comida.control_calidad.grasa_coccion_detectada = true;
    } else if (hasOil) {
      base.escaneo_comida.control_calidad.grasa_coccion_detectada = true;
    }

    // Regla 1: Escala y volumen (plato llano 25cm & volumen cm3)
    const totalGrams = base.escaneo_comida.ingredientes.reduce((sum, item) => sum + item.peso_estimado_g, 0);
    if (totalGrams > 0) {
      base.escaneo_comida.peso_total_preparado_g = totalGrams;
    }
    if (!base.escaneo_comida.control_calidad.volumen_estimado_cm3 && base.escaneo_comida.peso_total_preparado_g > 0) {
      // Densidad promedio de alimentos cocinados preparados ~1.05 g/cm³
      base.escaneo_comida.control_calidad.volumen_estimado_cm3 = Math.round(
        base.escaneo_comida.peso_total_preparado_g / 1.05
      );
    }

    // Regla 3: Coherencia matemática estricta
    // Calorías = (Proteínas × 4) + (Carbohidratos × 4) + (Grasas × 9) y suma porcentual = 100.0%
    let p = base.escaneo_comida.ingredientes.reduce((sum, item) => sum + item.proteinas_g, 0);
    let c = base.escaneo_comida.ingredientes.reduce((sum, item) => sum + item.carbohidratos_g, 0);
    let f = base.escaneo_comida.ingredientes.reduce((sum, item) => sum + item.grasas_g, 0);

    if (p === 0 && c === 0 && f === 0) {
      p = Number(esc.macronutrientes?.proteinas_g) || 0;
      c = Number(esc.macronutrientes?.carbohidratos_g) || 0;
      f = Number(esc.macronutrientes?.grasas_g) || 0;
    }

    p = Math.round(p * 10) / 10;
    c = Math.round(c * 10) / 10;
    f = Math.round(f * 10) / 10;

    const calculatedCalories = Math.round(p * 4 + c * 4 + f * 9);
    base.escaneo_comida.calorias_totales = calculatedCalories;

    let pPct = 0;
    let cPct = 0;
    let fPct = 0;

    if (calculatedCalories > 0) {
      pPct = Math.round(((p * 4) / calculatedCalories) * 1000) / 10;
      cPct = Math.round(((c * 4) / calculatedCalories) * 1000) / 10;
      // Remainder guarantees exact 100.0% sum
      fPct = Math.round((100.0 - (pPct + cPct)) * 10) / 10;
    }

    base.escaneo_comida.macronutrientes = {
      proteinas_g: p,
      carbohidratos_g: c,
      grasas_g: f,
      porcentaje_proteinas: pPct,
      porcentaje_carbohidratos: cPct,
      porcentaje_grasas: fPct,
    };
  }

  // Registro diario
  if (raw?.registro_diario) {
    const reg = raw.registro_diario;
    base.registro_diario.tiempo_comida = reg.tiempo_comida || null;
    base.registro_diario.descripcion_original = reg.descripcion_original || null;
    base.registro_diario.total_calorias = Number(reg.total_calorias) || 0;
    if (Array.isArray(reg.items_reconocidos)) {
      base.registro_diario.items_reconocidos = reg.items_reconocidos.map((it: any) => ({
        alimento: String(it.alimento || "Item"),
        porcion_estimada: String(it.porcion_estimada || "1 porción"),
        calorias: Number(it.calorias) || 0,
        proteinas_g: Number(it.proteinas_g) || 0,
        carbohidratos_g: Number(it.carbohidratos_g) || 0,
        grasas_g: Number(it.grasas_g) || 0,
      }));
      if (base.registro_diario.total_calorias === 0) {
        base.registro_diario.total_calorias = base.registro_diario.items_reconocidos.reduce(
          (sum, item) => sum + item.calorias,
          0
        );
      }
    }
  }

  // Metas y progreso
  if (raw?.metas_y_progreso) {
    const meta = raw.metas_y_progreso;
    base.metas_y_progreso.calorias_diarias_recomendadas = Number(meta.calorias_diarias_recomendadas) || 0;
    
    // BMR & TDEE calculation fallback if not provided by Gemini
    const bmr = Number(meta.tasa_metabolica_basal_bmr) || Math.round(base.metas_y_progreso.calorias_diarias_recomendadas * 0.78);
    const tdee = Number(meta.gasto_energetico_total_tdee) || Math.round(base.metas_y_progreso.calorias_diarias_recomendadas * 1.15);
    base.metas_y_progreso.tasa_metabolica_basal_bmr = bmr;
    base.metas_y_progreso.gasto_energetico_total_tdee = tdee;

    base.metas_y_progreso.rango_calorico = {
      min: Number(meta.rango_calorico?.min) || 0,
      max: Number(meta.rango_calorico?.max) || 0,
    };
    base.metas_y_progreso.macros_objetivo = {
      proteinas_g: Number(meta.macros_objetivo?.proteinas_g) || 0,
      carbohidratos_g: Number(meta.macros_objetivo?.carbohidratos_g) || 0,
      grasas_g: Number(meta.macros_objetivo?.grasas_g) || 0,
    };
    if (Array.isArray(meta.curva_progreso)) {
      base.metas_y_progreso.curva_progreso = meta.curva_progreso.map((pt: any) => ({
        etiqueta: String(pt.etiqueta || "Hito"),
        fecha_estimada: String(pt.fecha_estimada || ""),
        peso_proyectado_kg: Number(pt.peso_proyectado_kg) || 0,
      }));
    }
  }

  // Plan comidas
  if (raw?.plan_comidas && Array.isArray(raw.plan_comidas.dias)) {
    base.plan_comidas.dias = raw.plan_comidas.dias.map((d: any) => ({
      dia: d.dia || "Lunes",
      resumen_dia: {
        calorias: Number(d.resumen_dia?.calorias) || 0,
        proteinas_g: Number(d.resumen_dia?.proteinas_g) || 0,
        carbs_g: Number(d.resumen_dia?.carbs_g) || 0,
        grasas_g: Number(d.resumen_dia?.grasas_g) || 0,
      },
      comidas: Array.isArray(d.comidas)
        ? d.comidas.map((c: any) => ({
            tipo: c.tipo || "Almuerzo",
            nombre_receta: String(c.nombre_receta || "Receta nutritiva"),
            tiempo_preparacion_min: Number(c.tiempo_preparacion_min) || 20,
            calorias: Number(c.calorias) || 0,
            proteinas_g: Number(c.proteinas_g) || 0,
            carbs_g: Number(c.carbs_g) || 0,
            grasas_g: Number(c.grasas_g) || 0,
          }))
        : [],
    }));
  }

  // Lista compras
  if (Array.isArray(raw?.lista_compras)) {
    base.lista_compras = raw.lista_compras.map((cat: any) => ({
      categoria: String(cat.categoria || "Despensa General"),
      items: Array.isArray(cat.items)
        ? cat.items.map((it: any) => ({
            alimento: String(it.alimento || "Alimento"),
            cantidad_total: String(it.cantidad_total || "1 unidad"),
          }))
        : [],
    }));
  }

  // Modulo coach
  if (raw?.modulo_coach) {
    base.modulo_coach.respuesta_consulta = raw.modulo_coach.respuesta_consulta || null;
    if (raw.modulo_coach.sugerencia_ayuno) {
      base.modulo_coach.sugerencia_ayuno = {
        protocolo: String(raw.modulo_coach.sugerencia_ayuno.protocolo || "16:8"),
        ventana_ingesta: String(raw.modulo_coach.sugerencia_ayuno.ventana_ingesta || "12:00 PM - 8:00 PM"),
        recomendacion: String(raw.modulo_coach.sugerencia_ayuno.recomendacion || ""),
      };
    }
  }

  return base;
}
