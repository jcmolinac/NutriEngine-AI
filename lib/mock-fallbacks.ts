import { NutriEngineOutput, UserAntropoData } from "@/types/nutrition";
import { getEmptyNutriOutput } from "./nutrition-engine-service";

export function getMockScanFood(): NutriEngineOutput {
  const out = getEmptyNutriOutput("SCAN_FOOD");
  out.escaneo_comida = {
    nombre_plato: "Bowl Nórdico de Salmón a la Plancha con Quinoa y Aguacate",
    peso_total_preparado_g: 438,
    peso_g: 438,
    calorias_totales: 763,
    metodo_coccion_inferido: "plancha",
    puntuacion_confianza: 0.95,
    micro_preguntas_confirmacion: [
      "¿Se utilizó aceite de oliva al cocinar el salmón?",
      "¿La guarnición de quinoa lleva sal o caldo concentrado añadido?",
      "¿Consumiste alguna salsa o aderezo adicional?",
    ],
    macronutrientes: {
      proteinas_g: 47.6,
      carbohidratos_g: 41.3,
      grasas_g: 45.3,
      porcentaje_proteinas: 24.9,
      porcentaje_carbohidratos: 21.7,
      porcentaje_grasas: 53.4,
    },
    ingredientes: [
      {
        alimento: "Lomo de salmón fresco a la plancha",
        peso_estimado_g: 160,
        peso_g: 160,
        calorias: 326,
        proteinas_g: 32.0,
        carbohidratos_g: 0.0,
        grasas_g: 22.0,
      },
      {
        alimento: "Quinoa cocida con hierbas finas",
        peso_estimado_g: 140,
        peso_g: 140,
        calorias: 168,
        proteinas_g: 6.0,
        carbohidratos_g: 30.0,
        grasas_g: 2.7,
      },
      {
        alimento: "Aguacate Hass en láminas",
        peso_estimado_g: 60,
        peso_g: 60,
        calorias: 106,
        proteinas_g: 1.2,
        carbohidratos_g: 5.1,
        grasas_g: 9.0,
      },
      {
        alimento: "Edamames al vapor desvainados",
        peso_estimado_g: 70,
        peso_g: 70,
        calorias: 91,
        proteinas_g: 8.4,
        carbohidratos_g: 6.2,
        grasas_g: 3.6,
      },
      {
        alimento: "Aceite de cocción (salteado/plancha)",
        peso_estimado_g: 8,
        peso_g: 8,
        calorias: 72,
        proteinas_g: 0.0,
        carbohidratos_g: 0.0,
        grasas_g: 8.0,
      },
    ],
    control_calidad: {
      alimento_dentro_del_marco: true,
      ingredientes_visibles: true,
      advertencia_precision: null,
      referencia_plato_cm: 25,
      volumen_estimado_cm3: 417,
      grasa_coccion_detectada: true,
    },
    consejo_coach:
      "Plato de alta densidad nutricional estimado con referencia a plato estándar de 25 cm. Se detectó grasa de cocción en plancha (8g) asegurando precisión calórica. Excelente balance de Omega-3 y aminoácidos esenciales.",
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

  const recognizedItems: Array<{
    alimento: string;
    porcion_estimada: string;
    calorias: number;
    proteinas_g: number;
    carbohidratos_g: number;
    grasas_g: number;
  }> = [];

  // Parsear alimentos reales según lo introducido por el usuario
  if (lower.includes("huevo")) {
    recognizedItems.push({
      alimento: "Huevos enteros a la plancha o revueltos",
      porcion_estimada: "2 unidades (110 g)",
      calorias: 180,
      proteinas_g: 13,
      carbohidratos_g: 1.5,
      grasas_g: 13.5,
    });
  }
  if (lower.includes("pollo") || lower.includes("pechuga")) {
    recognizedItems.push({
      alimento: "Pechuga de pollo a la plancha",
      porcion_estimada: "1 filete mediano (150 g)",
      calorias: 248,
      proteinas_g: 46,
      carbohidratos_g: 0,
      grasas_g: 5.5,
    });
  }
  if (lower.includes("arroz")) {
    recognizedItems.push({
      alimento: "Arroz blanco o jazmín cocido",
      porcion_estimada: "1 taza pequeña (140 g)",
      calorias: 182,
      proteinas_g: 3.8,
      carbohidratos_g: 40,
      grasas_g: 0.8,
    });
  }
  if (lower.includes("ensalada") || lower.includes("lechuga")) {
    recognizedItems.push({
      alimento: "Ensalada verde fresca variada",
      porcion_estimada: "1 bol mediano (120 g)",
      calorias: 85,
      proteinas_g: 1.5,
      carbohidratos_g: 4,
      grasas_g: 7,
    });
  }
  if (lower.includes("pan") || lower.includes("tostada")) {
    recognizedItems.push({
      alimento: "Tostada de pan integral",
      porcion_estimada: "1 rebanada (40 g)",
      calorias: 105,
      proteinas_g: 3.8,
      carbohidratos_g: 19,
      grasas_g: 1.2,
    });
  }
  if (lower.includes("aguacate")) {
    recognizedItems.push({
      alimento: "Aguacate Hass fresco",
      porcion_estimada: "1/2 unidad (60 g)",
      calorias: 96,
      proteinas_g: 1.2,
      carbohidratos_g: 5,
      grasas_g: 8.8,
    });
  }
  if (lower.includes("cafe") || lower.includes("café")) {
    recognizedItems.push({
      alimento: "Café con leche ligera",
      porcion_estimada: "1 taza (180 ml)",
      calorias: 48,
      proteinas_g: 2.2,
      carbohidratos_g: 5.8,
      grasas_g: 1.5,
    });
  }
  if (lower.includes("fruta") || lower.includes("manzana") || lower.includes("platano") || lower.includes("plátano")) {
    recognizedItems.push({
      alimento: "Fruta fresca de temporada",
      porcion_estimada: "1 pieza (140 g)",
      calorias: 78,
      proteinas_g: 0.6,
      carbohidratos_g: 19,
      grasas_g: 0.3,
    });
  }
  if (lower.includes("yogur")) {
    recognizedItems.push({
      alimento: "Yogur natural",
      porcion_estimada: "1 vaso (125 g)",
      calorias: 85,
      proteinas_g: 5,
      carbohidratos_g: 6,
      grasas_g: 4,
    });
  }

  // Si no coincide con ninguna palabra clave, crear registro personalizado del texto
  if (recognizedItems.length === 0) {
    recognizedItems.push({
      alimento: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      porcion_estimada: "1 porción estimada (180 g)",
      calorias: 320,
      proteinas_g: 18,
      carbohidratos_g: 28,
      grasas_g: 14,
    });
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
  const edad = Number(user?.edad) || 42;
  const genero = user?.genero || "masculino";
  const pesoActual = Number(user?.peso_actual_kg) || 95;
  const altura = Number(user?.altura_cm) || 183;
  const pesoMeta = Number(user?.peso_meta_kg) || 82;
  const nivel = (user?.nivel_actividad || "sedentario").toLowerCase();

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
  const targetKcal = caloriasMeta && caloriasMeta > 1000 ? caloriasMeta : 1817;
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
