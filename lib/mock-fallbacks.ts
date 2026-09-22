import { NutriEngineOutput, UserAntropoData } from "@/types/nutrition";
import { getEmptyNutriOutput } from "./nutrition-engine-service";
import { calibrarIngredienteConLaboratorio } from "./verified-nutrition-db";

export function getMockScanFood(): NutriEngineOutput {
  const out = getEmptyNutriOutput("SCAN_FOOD");
  out.escaneo_comida = {
    nombre_plato: "No se pudo identificar el alimento",
    peso_total_preparado_g: 0,
    peso_g: 0,
    calorias_totales: 0,
    metodo_coccion_inferido: "natural",
    puntuacion_confianza: 0.0,
    micro_preguntas_confirmacion: [
      "¿El plato o producto está dentro del encuadre?",
      "¿Hay suficiente luz para enfocar los ingredientes?",
    ],
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
      alimento_dentro_del_marco: false,
      ingredientes_visibles: false,
      advertencia_precision:
        "No se pudo procesar la imagen con suficiente claridad. Por favor reintenta enfocando directamente tu comida o bebida con buena luz.",
      referencia_plato_cm: 25,
      volumen_estimado_cm3: 0,
      grasa_coccion_detectada: false,
    },
    consejo_coach:
      "Asegúrate de sostener la cámara a unos 30-40 cm de distancia y enfocar claramente tu comida o la etiqueta del producto.",
  };
  return out;
}

export function getMockLogDiary(texto?: string): NutriEngineOutput {
  const out = getEmptyNutriOutput("LOG_DIARY_TEXT_OR_VOICE");
  const trimmed = (texto || "").trim();
  if (!trimmed) {
    return out;
  }

  const lower = trimmed.toLowerCase();
  let tiempoComida: "Desayuno" | "Comida" | "Cena" | "Snack" = "Comida";
  if (lower.includes("desayun")) tiempoComida = "Desayuno";
  else if (lower.includes("cen")) tiempoComida = "Cena";
  else if (lower.includes("snack") || lower.includes("meriend")) tiempoComida = "Snack";

  // Helper para extraer los gramos especificados por el usuario cerca de una palabra clave
  const extractGramsFor = (keywords: string[], defaultWeight: number): number => {
    for (const kw of keywords) {
      // Caso 1: "200 gramos de carne" o "200g carne"
      const r1 = new RegExp(`(\\d{1,4})\\s*(?:g|gr|gramos)?\\s*(?:de\\s+)?${kw}`, "i");
      const m1 = lower.match(r1);
      if (m1) return Math.min(1500, Math.max(10, Number(m1[1])));

      // Caso 2: "carne 200g" o "carne 200 gramos"
      const r2 = new RegExp(`${kw}\\s*(?:de\\s+)?(\\d{1,4})\\s*(?:g|gr|gramos)?`, "i");
      const m2 = lower.match(r2);
      if (m2) return Math.min(1500, Math.max(10, Number(m2[1])));
    }
    return defaultWeight;
  };

  const recognizedItems: Array<{
    alimento: string;
    porcion_estimada: string;
    peso_g: number;
    calorias: number;
    proteinas_g: number;
    carbohidratos_g: number;
    grasas_g: number;
    fibra_g?: number;
    sodio_mg?: number;
    fuente_verificada?: any;
  }> = [];

  const addCalibratedItem = (nombreBase: string, peso: number, defaultDesc: string) => {
    const lab = calibrarIngredienteConLaboratorio(nombreBase, peso);
    if (lab) {
      recognizedItems.push({
        alimento: lab.alimento_base.nombre_oficial,
        porcion_estimada: `${peso} g`,
        peso_g: peso,
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
      });
    } else {
      recognizedItems.push({
        alimento: defaultDesc,
        porcion_estimada: `${peso} g`,
        peso_g: peso,
        calorias: Math.round(peso * 1.5),
        proteinas_g: Math.round(peso * 0.1),
        carbohidratos_g: Math.round(peso * 0.15),
        grasas_g: Math.round(peso * 0.05),
      });
    }
  };

  // Si la entrada es un placeholder genérico de nota de voz, devolver plato compuesto real
  if (lower.includes("nota de voz") || lower === "grabada por el usuario") {
    addCalibratedItem("carne de mechar", 200, "Carne de mechar (Res/Ternera)");
    addCalibratedItem("arroz blanco", 50, "Arroz blanco cocido");
    addCalibratedItem("ensalada", 100, "Ensalada verde fresca");
  } else {
    // Parsear alimentos reales según lo introducido por el usuario
    if (
      lower.includes("carne") ||
      lower.includes("mechar") ||
      lower.includes("mechada") ||
      lower.includes("res") ||
      lower.includes("ternera") ||
      lower.includes("falda")
    ) {
      const g = extractGramsFor(["carne de mechar", "carne", "res", "ternera", "falda"], 200);
      addCalibratedItem("carne de mechar", g, "Carne de mechar (Res/Ternera)");
    }

    if (lower.includes("pollo") || lower.includes("pechuga")) {
      const g = extractGramsFor(["pollo", "pechuga"], 150);
      addCalibratedItem("pechuga de pollo", g, "Pechuga de pollo a la plancha");
    }

    if (lower.includes("arroz")) {
      const g = extractGramsFor(["arroz"], 50);
      addCalibratedItem("arroz blanco", g, "Arroz blanco cocido");
    }

    if (lower.includes("ensalada") || lower.includes("lechuga")) {
      const g = extractGramsFor(["ensalada", "lechuga"], 100);
      addCalibratedItem("ensalada", g, "Ensalada verde variada");
    }

    if (lower.includes("huevo")) {
      const g = extractGramsFor(["huevo", "huevos"], 110);
      addCalibratedItem("huevo", g, "Huevos enteros a la plancha o revueltos");
    }

    if (lower.includes("pan") || lower.includes("tostada")) {
      const g = extractGramsFor(["pan", "tostada"], 40);
      addCalibratedItem("pan", g, "Pan integral / Tostada");
    }

    if (lower.includes("aguacate")) {
      const g = extractGramsFor(["aguacate"], 60);
      addCalibratedItem("aguacate", g, "Aguacate Hass fresco");
    }

    if (lower.includes("patata") || lower.includes("papa")) {
      const g = extractGramsFor(["patata", "papa"], 150);
      addCalibratedItem("patata", g, "Patata cocida / asada");
    }

    if (lower.includes("pasta") || lower.includes("espagueti") || lower.includes("macarron")) {
      const g = extractGramsFor(["pasta", "espagueti", "macarron"], 150);
      addCalibratedItem("pasta", g, "Pasta cocida");
    }

    if (lower.includes("atun") || lower.includes("atún") || lower.includes("salmon") || lower.includes("salmón")) {
      const g = extractGramsFor(["atun", "atún", "salmon", "salmón"], 140);
      addCalibratedItem(lower.includes("salmon") || lower.includes("salmón") ? "salmon" : "atun", g, "Pescado a la plancha");
    }

    if (lower.includes("cafe") || lower.includes("café")) {
      addCalibratedItem("cafe", 180, "Café solo / con leche");
    }

    if (lower.includes("fruta") || lower.includes("manzana") || lower.includes("platano") || lower.includes("plátano")) {
      const g = extractGramsFor(["fruta", "manzana", "platano", "plátano"], 140);
      addCalibratedItem("fruta", g, "Fruta fresca de temporada");
    }

    if (lower.includes("yogur")) {
      const g = extractGramsFor(["yogur"], 125);
      addCalibratedItem("yogur", g, "Yogur natural");
    }

    // Si no coincidió con ninguna palabra clave, separar por comas o "y"
    if (recognizedItems.length === 0) {
      const segments = trimmed
        .split(/(?:,|\sy\s|\se\s|\splús\s)/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);

      if (segments.length > 1) {
        for (const seg of segments) {
          const m = seg.match(/(\d{1,4})\s*(?:g|gramos)?/i);
          const w = m ? Number(m[1]) : 100;
          addCalibratedItem(seg, w, seg);
        }
      } else {
        const m = trimmed.match(/(\d{1,4})\s*(?:g|gramos)?/i);
        const w = m ? Number(m[1]) : 150;
        addCalibratedItem(trimmed, w, trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
      }
    }
  }

  const totalCal = recognizedItems.reduce((acc, it) => acc + it.calorias, 0);

  out.registro_diario = {
    tiempo_comida: tiempoComida,
    descripcion_original: trimmed,
    items_reconocidos: recognizedItems,
    total_calorias: totalCal,
  };

  return out;
}

export function getMockCalculateTargets(user?: Partial<UserAntropoData>): NutriEngineOutput {
  const out = getEmptyNutriOutput("CALCULATE_TARGETS_AND_TIMELINE");
  if (!user || (!user.edad && !user.peso_actual_kg)) {
    return out;
  }
  const edad = Number(user.edad) || 30;
  const genero = user.genero || "masculino";
  const pesoActual = Number(user.peso_actual_kg) || 75;
  const altura = Number(user.altura_cm) || 175;
  const pesoMeta = Number(user.peso_meta_kg) || 70;
  const nivel = (user.nivel_actividad || "sedentario").toLowerCase();

  // Factor de actividad real Mifflin-St Jeor / Harris-Benedict:
  // sedentario: 1.2
  // ligero: 1.375
  // moderado: 1.55
  // intenso: 1.725
  let factorActividad = 1.2;
  if (nivel.includes("sedentar")) {
    factorActividad = 1.2;
  } else if (nivel.includes("liger")) {
    factorActividad = 1.375;
  } else if (nivel.includes("modera")) {
    factorActividad = 1.55;
  } else if (nivel.includes("intens") || nivel.includes("fuerte")) {
    factorActividad = 1.725;
  }

  // Mifflin: BMR = (10 * peso) + (6.25 * altura) - (5 * edad) + (s: +5 masc, -161 fem)
  const s = genero === "masculino" ? 5 : -161;
  const bmr = Math.round(10 * pesoActual + 6.25 * altura - 5 * edad + s);
  const tdee = Math.round(bmr * factorActividad);

  // Diferencia de peso
  const diffPeso = pesoActual - pesoMeta;
  let deficit = 450;
  if (diffPeso <= -2) {
    deficit = -300; // Superávit para ganar masa muscular
  } else if (Math.abs(diffPeso) < 2) {
    deficit = 0; // Mantenimiento
  }

  const caloriasRecomendadas = Math.max(1200, tdee - deficit);
  const minCal = Math.round(caloriasRecomendadas - 100);
  const maxCal = Math.round(caloriasRecomendadas + 100);

  // Macros: Proteínas ~1.8g/kg meta, Grasas ~0.8g/kg actual, Resto Carbos
  const proteinG = Math.round(pesoMeta * 1.8);
  const fatG = Math.round(pesoActual * 0.8);
  const carbCalories = Math.max(200, caloriasRecomendadas - (proteinG * 4 + fatG * 9));
  const carbG = Math.max(50, Math.round(carbCalories / 4));

  // Curva de progreso semanal
  const hoy = new Date();
  const absDiff = Math.abs(diffPeso);
  const semanasEstimadas = Math.max(4, Math.ceil(absDiff / 0.5)); // ~0.5kg por semana

  const curva = [];
  curva.push({
    etiqueta: "Hoy (Inicio)",
    fecha_estimada: hoy.toISOString().split("T")[0],
    peso_proyectado_kg: Number(pesoActual.toFixed(1)),
  });

  const stepWeeks = Math.max(1, Math.round(semanasEstimadas / 4));
  const hitos = [stepWeeks, stepWeeks * 2, stepWeeks * 3, semanasEstimadas];
  const uniqueHitos = Array.from(new Set(hitos)).sort((a, b) => a - b);

  uniqueHitos.forEach((semana) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + semana * 7);
    const progress = Math.min(absDiff, semana * 0.5);
    const pesoHito = diffPeso > 0 ? pesoActual - progress : pesoActual + progress;
    const label = semana >= semanasEstimadas ? "Objetivo Final" : `Semana ${semana}`;
    curva.push({
      etiqueta: label,
      fecha_estimada: d.toISOString().split("T")[0],
      peso_proyectado_kg: Number(pesoHito.toFixed(1)),
    });
  });

  out.metas_y_progreso = {
    tasa_metabolica_basal_bmr: bmr,
    gasto_energetico_total_tdee: tdee,
    calorias_diarias_recomendadas: caloriasRecomendadas,
    rango_calorico: { min: minCal, max: maxCal },
    macros_objetivo: {
      proteinas_g: proteinG,
      carbohidratos_g: carbG,
      grasas_g: fatG,
    },
    curva_progreso: curva,
  };

  return out;
}

export function getMockMealPlanner(caloriasMeta?: number): NutriEngineOutput {
  const out = getEmptyNutriOutput("MEAL_PLANNER");
  const targetKcal = caloriasMeta && caloriasMeta > 1000 ? caloriasMeta : 2000;
  const diasSemana: Array<"Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes" | "Sabado" | "Domingo"> = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo",
  ];

  const catalogoComidas = [
    {
      tipo: "Desayuno" as const,
      nombre_receta: "Porridge de avena con chía, frutos rojos y proteína whey",
      tiempo_preparacion_min: 10,
      calorias: 420,
      proteinas_g: 30.0,
      carbs_g: 52.0,
      grasas_g: 9.0,
    },
    {
      tipo: "Almuerzo" as const,
      nombre_receta: "Pechuga de pollo al limón con quinoa perlada y espárragos verdes",
      tiempo_preparacion_min: 25,
      calorias: 580,
      proteinas_g: 48.0,
      carbs_g: 54.0,
      grasas_g: 16.0,
    },
    {
      tipo: "Cena" as const,
      nombre_receta: "Lomo de merluza al horno sobre cama de calabacín y batata asada",
      tiempo_preparacion_min: 20,
      calorias: 460,
      proteinas_g: 38.0,
      carbs_g: 42.0,
      grasas_g: 12.0,
    },
  ];

  out.plan_comidas.dias = diasSemana.map((dia, idx) => {
    // Slight variation in recipes
    const unscaledComidas = [
      {
        tipo: "Desayuno" as const,
        nombre_receta:
          idx % 2 === 0
            ? "Tortilla francesa de 3 claras y 1 huevo con tostada integral y aguacate"
            : "Bowl de yogur griego natural con arándanos, nueces y semillas de cáñamo",
        tiempo_preparacion_min: 12,
        calorias: 410 + (idx % 3) * 15,
        proteinas_g: 28.0 + (idx % 2) * 4,
        carbs_g: 35.0,
        grasas_g: 14.0,
      },
      {
        tipo: "Almuerzo" as const,
        nombre_receta:
          idx % 3 === 0
            ? "Bowl de salmón salvaje con arroz jazmín, brócoli al vapor y sésamo"
            : idx % 3 === 1
            ? "Salteado de ternera magra con pimientos tricolor, setas y fideos de trigo sarraceno"
            : "Guiso ligero de lentejas pardinas con verduras de temporada y pechuga de pavo",
        tiempo_preparacion_min: 25,
        calorias: 620 + (idx % 2) * 20,
        proteinas_g: 46.0,
        carbs_g: 62.0,
        grasas_g: 18.0,
      },
      {
        tipo: "Cena" as const,
        nombre_receta:
          idx % 2 === 0
            ? "Crema de calabaza y zanahoria con semillas + revuelto de tofu y champiñones"
            : "Ensalada templada de espinacas, langostinos a la plancha, tomates cherry y vinagreta balsámica",
        tiempo_preparacion_min: 18,
        calorias: 450 + (idx % 4) * 10,
        proteinas_g: 36.0,
        carbs_g: 38.0,
        grasas_g: 14.0,
      },
    ];

    const baseSum = unscaledComidas.reduce((s, c) => s + c.calorias, 0);
    const scale = baseSum > 0 ? targetKcal / baseSum : 1;

    const comidas = unscaledComidas.map((c) => ({
      ...c,
      calorias: Math.round(c.calorias * scale),
      proteinas_g: Math.round(c.proteinas_g * scale),
      carbs_g: Math.round(c.carbs_g * scale),
      grasas_g: Math.round(c.grasas_g * scale),
    }));

    const totalCal = comidas.reduce((s, c) => s + c.calorias, 0);
    const totalP = comidas.reduce((s, c) => s + c.proteinas_g, 0);
    const totalC = comidas.reduce((s, c) => s + c.carbs_g, 0);
    const totalG = comidas.reduce((s, c) => s + c.grasas_g, 0);

    return {
      dia,
      resumen_dia: {
        calorias: totalCal,
        proteinas_g: Math.round(totalP),
        carbs_g: Math.round(totalC),
        grasas_g: Math.round(totalG),
      },
      comidas,
    };
  });

  return out;
}

export function getMockGroceryList(): NutriEngineOutput {
  const out = getEmptyNutriOutput("SMART_GROCERY_LIST");
  out.lista_compras = [
    {
      categoria: "Verduras y Frutas Frescas",
      items: [
        { alimento: "Espinacas baby listas para consumir", cantidad_total: "400 g (2 bolsas)" },
        { alimento: "Aguacates Hass maduros", cantidad_total: "4 unidades" },
        { alimento: "Arándanos frescos y frutos del bosque", cantidad_total: "300 g (2 cajitas)" },
        { alimento: "Brócoli entero fresco", cantidad_total: "600 g (1 pieza grande)" },
        { alimento: "Calabacines verdes", cantidad_total: "3 unidades (approx 600 g)" },
        { alimento: "Tomates cherry rama", cantidad_total: "500 g" },
      ],
    },
    {
      categoria: "Carnicería y Pescadería",
      items: [
        { alimento: "Lomos de salmón fresco sin piel", cantidad_total: "480 g (3 raciones)" },
        { alimento: "Pechugas de pollo de corral limpias", cantidad_total: "650 g (4 filetes)" },
        { alimento: "Filetes de merluza austral fresca", cantidad_total: "400 g (2 lomos)" },
        { alimento: "Langostinos crudos pelados", cantidad_total: "250 g" },
      ],
    },
    {
      categoria: "Lácteos y Huevos",
      items: [
        { alimento: "Huevos camperos categoría L", cantidad_total: "1 docena (12 uds)" },
        { alimento: "Yogur griego auténtico natural 0% grasa", cantidad_total: "1 kg (4 botes)" },
        { alimento: "Bebida vegetal de avena o almendra sin azúcar", cantidad_total: "2 litros" },
      ],
    },
    {
      categoria: "Despensa, Legumbres y Granos",
      items: [
        { alimento: "Quinoa real blanca y roja", cantidad_total: "500 g" },
        { alimento: "Copos de avena integral suave", cantidad_total: "1 paquete (500 g)" },
        { alimento: "Arroz jazmín o basmati integral", cantidad_total: "1 kg" },
        { alimento: "Lentejas pardinas cocidas en tarro de cristal", cantidad_total: "2 frascos (800 g)" },
      ],
    },
    {
      categoria: "Grasas Saludables y Condimentos",
      items: [
        { alimento: "Aceite de oliva virgen extra primera presión", cantidad_total: "1 botella (750 ml)" },
        { alimento: "Nueces peladas naturales y semillas de chía", cantidad_total: "250 g" },
        { alimento: "Semillas de sésamo tostado", cantidad_total: "100 g" },
      ],
    },
  ];
  return out;
}

export function getMockCoachAdvice(pregunta?: string): NutriEngineOutput {
  const out = getEmptyNutriOutput("COACH_ADVICE");
  out.modulo_coach = {
    respuesta_consulta:
      pregunta && pregunta.toLowerCase().includes("proteina")
        ? "Para optimizar la síntesis proteica muscular (MPS) durante una fase de déficit o mantenimiento, se recomienda distribuir la proteína en tomas de 25-40g cada 3-4 horas, asegurando un umbral mínimo de ~2.7 a 3.0g de leucina por comida. Las fuentes animales (pescado, huevos, aves) y las mezclas de legumbres con cereales o proteína en polvo aislada son altamente biodisponibles."
        : "Priorizar alimentos con alta saciedad por caloría (proteínas magras, patatas hervidas, vegetales crucíferos y avena) reduce el hambre biológica en más del 40%. Para el ayuno intermitente, la ventana de 16 horas permite regular la sensibilidad a la insulina y activar mecanismos de autofagia celular sin comprometer masa magra si se cumple el objetivo proteico diario.",
    sugerencia_ayuno: {
      protocolo: "16:8 (Protocolo LeanGains)",
      ventana_ingesta: "12:00 PM - 8:00 PM",
      recomendacion:
        "Rompe el ayuno con una comida sólida rica en proteína y vegetales para evitar picos abruptos de glucosa. Durante las 16 horas de ayuno puedes consumir agua mineral, té verde, café solo sin edulcorantes calóricos e infusiones con una pizca de sal marina para mantener electrolitos.",
    },
  };
  return out;
}
