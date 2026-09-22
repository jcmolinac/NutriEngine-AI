import { PlanComidas, DiaPlan, ComidaPlan, CategoriaCompra } from "@/types/nutrition";

export interface PlanningIngredient {
  id: string;
  name: string;
  emoji: string;
  category: "proteinas" | "carbohidratos" | "vegetales" | "grasas";
  codigo_referencia: string;
  db_source: "BEDCA" | "USDA";
  kcal_100g: number;
  p_100g: number;
  c_100g: number;
  g_100g: number;
}

export const CLINICAL_INGREDIENTS: PlanningIngredient[] = [
  // PROTEÍNAS CLÍNICAS (BEDCA / USDA)
  {
    id: "pollo",
    name: "Pechuga de pollo",
    emoji: "🍗",
    category: "proteinas",
    codigo_referencia: "BEDCA-0101",
    db_source: "BEDCA",
    kcal_100g: 156,
    p_100g: 31.0,
    c_100g: 0,
    g_100g: 3.6,
  },
  {
    id: "carne_mechar",
    name: "Carne de mechar (Ternera/Res)",
    emoji: "🥩",
    category: "proteinas",
    codigo_referencia: "BEDCA-0204",
    db_source: "BEDCA",
    kcal_100g: 211,
    p_100g: 29.8,
    c_100g: 0,
    g_100g: 10.2,
  },
  {
    id: "salmon",
    name: "Salmón salvaje",
    emoji: "🐟",
    category: "proteinas",
    codigo_referencia: "USDA-173686",
    db_source: "USDA",
    kcal_100g: 206,
    p_100g: 22.1,
    c_100g: 0,
    g_100g: 12.3,
  },
  {
    id: "merluza",
    name: "Merluza fresca / Pescado blanco",
    emoji: "🐟",
    category: "proteinas",
    codigo_referencia: "BEDCA-0301",
    db_source: "BEDCA",
    kcal_100g: 89,
    p_100g: 17.5,
    c_100g: 0,
    g_100g: 1.8,
  },
  {
    id: "huevos",
    name: "Huevos camperos enteros",
    emoji: "🥚",
    category: "proteinas",
    codigo_referencia: "BEDCA-0501",
    db_source: "BEDCA",
    kcal_100g: 147,
    p_100g: 12.8,
    c_100g: 0.7,
    g_100g: 10.1,
  },
  {
    id: "atun",
    name: "Atún claro al natural",
    emoji: "🥫",
    category: "proteinas",
    codigo_referencia: "BEDCA-0312",
    db_source: "BEDCA",
    kcal_100g: 116,
    p_100g: 26.0,
    c_100g: 0,
    g_100g: 1.2,
  },
  {
    id: "tofu",
    name: "Tofu firme de soja",
    emoji: "🧈",
    category: "proteinas",
    codigo_referencia: "USDA-172448",
    db_source: "USDA",
    kcal_100g: 144,
    p_100g: 17.3,
    c_100g: 2.8,
    g_100g: 8.7,
  },
  {
    id: "lentejas",
    name: "Lentejas cocidas",
    emoji: "🫘",
    category: "proteinas",
    codigo_referencia: "BEDCA-0450",
    db_source: "BEDCA",
    kcal_100g: 116,
    p_100g: 9.0,
    c_100g: 20.1,
    g_100g: 0.4,
  },

  // CARBOHIDRATOS & GRANOS COMPLEJOS (BEDCA / USDA)
  {
    id: "arroz",
    name: "Arroz jazmín / blanco",
    emoji: "🍚",
    category: "carbohidratos",
    codigo_referencia: "BEDCA-0401",
    db_source: "BEDCA",
    kcal_100g: 126,
    p_100g: 2.7,
    c_100g: 28.2,
    g_100g: 0.3,
  },
  {
    id: "avena",
    name: "Avena integral en copos",
    emoji: "🌾",
    category: "carbohidratos",
    codigo_referencia: "USDA-169705",
    db_source: "USDA",
    kcal_100g: 379,
    p_100g: 13.2,
    c_100g: 67.7,
    g_100g: 6.5,
  },
  {
    id: "patata",
    name: "Patata hervida o al vapor",
    emoji: "🥔",
    category: "carbohidratos",
    codigo_referencia: "BEDCA-0601",
    db_source: "BEDCA",
    kcal_100g: 87,
    p_100g: 1.9,
    c_100g: 20.1,
    g_100g: 0.1,
  },
  {
    id: "batata",
    name: "Batata / Boniato asado",
    emoji: "🍠",
    category: "carbohidratos",
    codigo_referencia: "USDA-168483",
    db_source: "USDA",
    kcal_100g: 90,
    p_100g: 2.0,
    c_100g: 20.7,
    g_100g: 0.2,
  },
  {
    id: "quinoa",
    name: "Quinoa perlada cocida",
    emoji: "🥗",
    category: "carbohidratos",
    codigo_referencia: "USDA-168917",
    db_source: "USDA",
    kcal_100g: 120,
    p_100g: 4.4,
    c_100g: 21.3,
    g_100g: 1.9,
  },
  {
    id: "pasta_integral",
    name: "Pasta integral cocida",
    emoji: "🍝",
    category: "carbohidratos",
    codigo_referencia: "BEDCA-0420",
    db_source: "BEDCA",
    kcal_100g: 148,
    p_100g: 5.8,
    c_100g: 29.3,
    g_100g: 1.4,
  },

  // VEGETALES Y FIBRA FRESCA
  {
    id: "brocoli",
    name: "Brócoli fresco al vapor",
    emoji: "🥦",
    category: "vegetales",
    codigo_referencia: "BEDCA-0610",
    db_source: "BEDCA",
    kcal_100g: 35,
    p_100g: 2.8,
    c_100g: 4.5,
    g_100g: 0.4,
  },
  {
    id: "espinacas",
    name: "Espinacas baby",
    emoji: "🥬",
    category: "vegetales",
    codigo_referencia: "BEDCA-0620",
    db_source: "BEDCA",
    kcal_100g: 23,
    p_100g: 2.9,
    c_100g: 1.6,
    g_100g: 0.4,
  },
  {
    id: "calabacin",
    name: "Calabacín a la plancha",
    emoji: "🥒",
    category: "vegetales",
    codigo_referencia: "BEDCA-0630",
    db_source: "BEDCA",
    kcal_100g: 17,
    p_100g: 1.2,
    c_100g: 3.1,
    g_100g: 0.3,
  },
  {
    id: "tomate",
    name: "Tomates cherry rama",
    emoji: "🍅",
    category: "vegetales",
    codigo_referencia: "BEDCA-0640",
    db_source: "BEDCA",
    kcal_100g: 18,
    p_100g: 0.9,
    c_100g: 3.5,
    g_100g: 0.2,
  },
  {
    id: "aguacate",
    name: "Aguacate Hass",
    emoji: "🥑",
    category: "grasas",
    codigo_referencia: "USDA-171705",
    db_source: "USDA",
    kcal_100g: 160,
    p_100g: 2.0,
    c_100g: 8.5,
    g_100g: 14.7,
  },
  {
    id: "champinones",
    name: "Champiñones laminados",
    emoji: "🍄",
    category: "vegetales",
    codigo_referencia: "BEDCA-0655",
    db_source: "BEDCA",
    kcal_100g: 22,
    p_100g: 3.1,
    c_100g: 3.3,
    g_100g: 0.3,
  },

  // GRASAS SALUDABLES & LÁCTEOS
  {
    id: "aceite_oliva",
    name: "Aceite de oliva virgen extra",
    emoji: "🫒",
    category: "grasas",
    codigo_referencia: "BEDCA-0701",
    db_source: "BEDCA",
    kcal_100g: 884,
    p_100g: 0,
    c_100g: 0,
    g_100g: 100.0,
  },
  {
    id: "nueces",
    name: "Nueces peladas naturales",
    emoji: "🥜",
    category: "grasas",
    codigo_referencia: "BEDCA-0710",
    db_source: "BEDCA",
    kcal_100g: 654,
    p_100g: 15.2,
    c_100g: 13.7,
    g_100g: 65.2,
  },
  {
    id: "yogur_griego",
    name: "Yogur griego natural 0%",
    emoji: "🥛",
    category: "proteinas",
    codigo_referencia: "USDA-171284",
    db_source: "USDA",
    kcal_100g: 59,
    p_100g: 10.0,
    c_100g: 3.6,
    g_100g: 0.4,
  },
];

export const DEFAULT_SELECTED_INGREDIENTS = [
  "pollo",
  "carne_mechar",
  "salmon",
  "huevos",
  "arroz",
  "avena",
  "patata",
  "brocoli",
  "espinacas",
  "aguacate",
  "aceite_oliva",
];

interface RecipeTemplate {
  tipo: "Desayuno" | "Almuerzo" | "Cena";
  name: string;
  tiempo: number;
  baseKcal: number;
  baseP: number;
  baseC: number;
  baseG: number;
  requiredIds: string[];
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
  // DESAYUNOS
  {
    tipo: "Desayuno",
    name: "Tortilla de huevos camperos con aguacate y tomate",
    tiempo: 10,
    baseKcal: 420,
    baseP: 24,
    baseC: 16,
    baseG: 28,
    requiredIds: ["huevos", "aguacate", "tomate"],
  },
  {
    tipo: "Desayuno",
    name: "Porridge de avena templada con nueces y yogur griego",
    tiempo: 8,
    baseKcal: 440,
    baseP: 26,
    baseC: 54,
    baseG: 14,
    requiredIds: ["avena", "yogur_griego", "nueces"],
  },
  {
    tipo: "Desayuno",
    name: "Huevos revueltos sobre tostada con espinacas baby salteadas",
    tiempo: 10,
    baseKcal: 390,
    baseP: 22,
    baseC: 28,
    baseG: 18,
    requiredIds: ["huevos", "espinacas", "aceite_oliva"],
  },
  {
    tipo: "Desayuno",
    name: "Bowl proteico de avena integral con frutos secos",
    tiempo: 5,
    baseKcal: 410,
    baseP: 18,
    baseC: 58,
    baseG: 14,
    requiredIds: ["avena", "nueces"],
  },
  {
    tipo: "Desayuno",
    name: "Revuelto de claras y huevo con champiñones al oliva",
    tiempo: 12,
    baseKcal: 360,
    baseP: 28,
    baseC: 12,
    baseG: 16,
    requiredIds: ["huevos", "champinones", "aceite_oliva"],
  },

  // ALMUERZOS
  {
    tipo: "Almuerzo",
    name: "Pechuga de pollo a la plancha con arroz jazmín y brócoli",
    tiempo: 20,
    baseKcal: 680,
    baseP: 52,
    baseC: 64,
    baseG: 18,
    requiredIds: ["pollo", "arroz", "brocoli"],
  },
  {
    tipo: "Almuerzo",
    name: "Falda de ternera mechada con patata cocida y ensalada fresca",
    tiempo: 25,
    baseKcal: 720,
    baseP: 54,
    baseC: 58,
    baseG: 24,
    requiredIds: ["carne_mechar", "patata", "tomate"],
  },
  {
    tipo: "Almuerzo",
    name: "Lomo de salmón salvaje con arroz y espinacas salteadas",
    tiempo: 18,
    baseKcal: 740,
    baseP: 48,
    baseC: 56,
    baseG: 28,
    requiredIds: ["salmon", "arroz", "espinacas"],
  },
  {
    tipo: "Almuerzo",
    name: "Pollo dorado con batata asada al romero y calabacín",
    tiempo: 25,
    baseKcal: 650,
    baseP: 48,
    baseC: 62,
    baseG: 16,
    requiredIds: ["pollo", "batata", "calabacin"],
  },
  {
    tipo: "Almuerzo",
    name: "Guiso magro de ternera con patatas y champiñones",
    tiempo: 30,
    baseKcal: 700,
    baseP: 50,
    baseC: 58,
    baseG: 22,
    requiredIds: ["carne_mechar", "patata", "champinones"],
  },
  {
    tipo: "Almuerzo",
    name: "Bowl de quinoa templada con salmón y aguacate Hass",
    tiempo: 15,
    baseKcal: 710,
    baseP: 44,
    baseC: 52,
    baseG: 30,
    requiredIds: ["salmon", "quinoa", "aguacate"],
  },
  {
    tipo: "Almuerzo",
    name: "Plato de lentejas estofadas con verduras y pollo deshebrado",
    tiempo: 20,
    baseKcal: 640,
    baseP: 46,
    baseC: 68,
    baseG: 12,
    requiredIds: ["pollo", "lentejas", "espinacas"],
  },
  {
    tipo: "Almuerzo",
    name: "Pasta integral con atún claro, tomate natural y albahaca",
    tiempo: 15,
    baseKcal: 620,
    baseP: 42,
    baseC: 72,
    baseG: 14,
    requiredIds: ["atun", "pasta_integral", "tomate"],
  },

  // CENAS
  {
    tipo: "Cena",
    name: "Filete de merluza al vapor sobre cama de calabacín y patata",
    tiempo: 18,
    baseKcal: 480,
    baseP: 38,
    baseC: 44,
    baseG: 12,
    requiredIds: ["merluza", "calabacin", "patata"],
  },
  {
    tipo: "Cena",
    name: "Pechuga de pollo a las hierbas con brócoli y crema ligera",
    tiempo: 15,
    baseKcal: 490,
    baseP: 44,
    baseC: 22,
    baseG: 16,
    requiredIds: ["pollo", "brocoli", "aceite_oliva"],
  },
  {
    tipo: "Cena",
    name: "Salmón a la plancha con espinacas baby y tomates cherry",
    tiempo: 14,
    baseKcal: 530,
    baseP: 42,
    baseC: 18,
    baseG: 26,
    requiredIds: ["salmon", "espinacas", "tomate"],
  },
  {
    tipo: "Cena",
    name: "Salteado de tofu firme con champiñones y verduras al wok",
    tiempo: 15,
    baseKcal: 460,
    baseP: 32,
    baseC: 30,
    baseG: 18,
    requiredIds: ["tofu", "champinones", "calabacin"],
  },
  {
    tipo: "Cena",
    name: "Tortilla francesa con ensalada verde de aguacate y tomate",
    tiempo: 10,
    baseKcal: 440,
    baseP: 22,
    baseC: 14,
    baseG: 28,
    requiredIds: ["huevos", "aguacate", "tomate"],
  },
  {
    tipo: "Cena",
    name: "Merluza al horno con espárragos/brócoli y toque de aceite virgen",
    tiempo: 20,
    baseKcal: 450,
    baseP: 36,
    baseC: 20,
    baseG: 14,
    requiredIds: ["merluza", "brocoli", "aceite_oliva"],
  },
];

const DIAS_SEMANA: Array<"Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes" | "Sabado" | "Domingo"> = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export function generateWeeklyPlanFromIngredients(
  selectedFoodKeys: string[],
  targetCalories: number
): { plan: PlanComidas; groceryList: CategoriaCompra[] } {
  const selectedSet = new Set(
    selectedFoodKeys.length > 0 ? selectedFoodKeys : DEFAULT_SELECTED_INGREDIENTS
  );
  const targetKcal = targetCalories > 1000 ? targetCalories : 1800;

  // Filtrar recetas que maximicen el uso de los ingredientes seleccionados
  const getBestRecipes = (tipo: "Desayuno" | "Almuerzo" | "Cena") => {
    const matching = RECIPE_TEMPLATES.filter((r) => r.tipo === tipo);
    // Ordenar por cuántos ingredientes requeridos están en el conjunto del usuario
    return matching.sort((a, b) => {
      const matchA = a.requiredIds.filter((id) => selectedSet.has(id)).length;
      const matchB = b.requiredIds.filter((id) => selectedSet.has(id)).length;
      return matchB - matchA;
    });
  };

  const desayunos = getBestRecipes("Desayuno");
  const almuerzos = getBestRecipes("Almuerzo");
  const cenas = getBestRecipes("Cena");

  const usedIngredientsCount: Record<string, number> = {};

  const dias: DiaPlan[] = DIAS_SEMANA.map((dia, idx) => {
    const desTemplate = desayunos[idx % desayunos.length];
    const almTemplate = almuerzos[idx % almuerzos.length];
    const cenTemplate = cenas[idx % cenas.length];

    // Registrar ingredientes para lista de compras
    [...desTemplate.requiredIds, ...almTemplate.requiredIds, ...cenTemplate.requiredIds].forEach(
      (ingId) => {
        usedIngredientsCount[ingId] = (usedIngredientsCount[ingId] || 0) + 1;
      }
    );

    const baseSum = desTemplate.baseKcal + almTemplate.baseKcal + cenTemplate.baseKcal;
    const ratio = baseSum > 0 ? targetKcal / baseSum : 1;

    const scaleComida = (tpl: RecipeTemplate, pctTarget: number): ComidaPlan => {
      const mealTarget = targetKcal * pctTarget;
      const localRatio = mealTarget / tpl.baseKcal;
      return {
        tipo: tpl.tipo,
        nombre_receta: tpl.name,
        tiempo_preparacion_min: tpl.tiempo,
        calorias: Math.round(tpl.baseKcal * localRatio),
        proteinas_g: Math.round(tpl.baseP * localRatio),
        carbs_g: Math.round(tpl.baseC * localRatio),
        grasas_g: Math.round(tpl.baseG * localRatio),
      };
    };

    const comidaDes = scaleComida(desTemplate, 0.25);
    const comidaAlm = scaleComida(almTemplate, 0.45);
    const comidaCen = scaleComida(cenTemplate, 0.30);

    const totalCal = comidaDes.calorias + comidaAlm.calorias + comidaCen.calorias;
    const totalP = comidaDes.proteinas_g + comidaAlm.proteinas_g + comidaCen.proteinas_g;
    const totalC = comidaDes.carbs_g + comidaAlm.carbs_g + comidaCen.carbs_g;
    const totalG = comidaDes.grasas_g + comidaAlm.grasas_g + comidaCen.grasas_g;

    return {
      dia,
      resumen_dia: {
        calorias: totalCal,
        proteinas_g: totalP,
        carbs_g: totalC,
        grasas_g: totalG,
      },
      comidas: [comidaDes, comidaAlm, comidaCen],
    };
  });

  // Generar Lista de Compras clasificada por pasillo según los ingredientes seleccionados
  const groceryList: CategoriaCompra[] = [];
  const categoriasMap: Record<string, Array<{ alimento: string; cantidad_total: string }>> = {
    "Carnicería y Pescadería": [],
    "Lácteos y Huevos": [],
    "Verduras y Frutas Frescas": [],
    "Despensa, Legumbres y Granos": [],
    "Grasas Saludables": [],
  };

  CLINICAL_INGREDIENTS.forEach((ing) => {
    if (!selectedSet.has(ing.id)) return;
    const timesUsed = usedIngredientsCount[ing.id] || 1;

    let displayQty = "";
    let catTarget = "Despensa, Legumbres y Granos";

    if (ing.id === "pollo") {
      displayQty = `${timesUsed * 180} g (${timesUsed} filetes limpios)`;
      catTarget = "Carnicería y Pescadería";
    } else if (ing.id === "carne_mechar") {
      displayQty = `${timesUsed * 200} g (falda magra de ternera)`;
      catTarget = "Carnicería y Pescadería";
    } else if (ing.id === "salmon") {
      displayQty = `${timesUsed * 160} g (${timesUsed} lomos frescos)`;
      catTarget = "Carnicería y Pescadería";
    } else if (ing.id === "merluza") {
      displayQty = `${timesUsed * 180} g (${timesUsed} lomos sin espinas)`;
      catTarget = "Carnicería y Pescadería";
    } else if (ing.id === "huevos") {
      displayQty = `${Math.max(6, timesUsed * 2)} unidades (camperos)`;
      catTarget = "Lácteos y Huevos";
    } else if (ing.id === "yogur_griego") {
      displayQty = `${timesUsed * 125} g (${Math.ceil(timesUsed / 2)} botes)`;
      catTarget = "Lácteos y Huevos";
    } else if (ing.id === "atun") {
      displayQty = `${timesUsed} latas al natural`;
      catTarget = "Carnicería y Pescadería";
    } else if (ing.id === "arroz") {
      displayQty = `${timesUsed * 70} g en seco (~1 paquete)`;
      catTarget = "Despensa, Legumbres y Granos";
    } else if (ing.id === "avena") {
      displayQty = "500 g (1 paquete copos suaves)";
      catTarget = "Despensa, Legumbres y Granos";
    } else if (ing.id === "patata") {
      displayQty = `${timesUsed * 200} g (${timesUsed} piezas medianas)`;
      catTarget = "Verduras y Frutas Frescas";
    } else if (ing.id === "batata") {
      displayQty = `${timesUsed * 180} g (${timesUsed} batatas)`;
      catTarget = "Verduras y Frutas Frescas";
    } else if (ing.id === "brocoli") {
      displayQty = `${Math.ceil(timesUsed / 2)} pieza(s) grande(s) (~500g)`;
      catTarget = "Verduras y Frutas Frescas";
    } else if (ing.id === "espinacas") {
      displayQty = `${Math.ceil(timesUsed / 2)} bolsa(s) listas (300g)`;
      catTarget = "Verduras y Frutas Frescas";
    } else if (ing.id === "calabacin") {
      displayQty = `${timesUsed} pieza(s) fresca(s)`;
      catTarget = "Verduras y Frutas Frescas";
    } else if (ing.id === "tomate") {
      displayQty = "1 caja de cherrys rama (500g)";
      catTarget = "Verduras y Frutas Frescas";
    } else if (ing.id === "aguacate") {
      displayQty = `${Math.min(4, timesUsed)} unidades maduras`;
      catTarget = "Grasas Saludables";
    } else if (ing.id === "aceite_oliva") {
      displayQty = "1 botella AOVE (primera presión)";
      catTarget = "Grasas Saludables";
    } else if (ing.id === "nueces") {
      displayQty = "1 bolsita (200g) naturales";
      catTarget = "Grasas Saludables";
    } else {
      displayQty = `${timesUsed * 100} g`;
    }

    categoriasMap[catTarget]?.push({
      alimento: `${ing.emoji} ${ing.name} (${ing.codigo_referencia})`,
      cantidad_total: displayQty,
    });
  });

  Object.entries(categoriasMap).forEach(([categoria, items]) => {
    if (items.length > 0) {
      groceryList.push({ categoria, items });
    }
  });

  return {
    plan: { dias },
    groceryList,
  };
}
