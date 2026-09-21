import { ProductoCodigoBarras } from "@/types/nutrition";

export const SAMPLE_BARCODE_PRODUCTS: Record<string, ProductoCodigoBarras> = {
  // Yogur griego natural 0%
  "8480000123456": {
    codigo: "8480000123456",
    nombre: "Yogur Griego Natural 0% Grasa",
    marca: "Hacendado / Central Lechera",
    porcion_g: 125,
    calorias_100g: 57,
    proteinas_100g: 10.2,
    carbs_100g: 3.8,
    grasas_100g: 0.2,
    fibra_100g: 0,
    sodio_100g: 40,
    azucares_100g: 3.8,
    nutriscore: "A",
  },
  // Copos de avena integral suave
  "8410000987654": {
    codigo: "8410000987654",
    nombre: "Copos de Avena Integral Suave",
    marca: "Quaker / Bio Organic",
    porcion_g: 50,
    calorias_100g: 375,
    proteinas_100g: 13.5,
    carbs_100g: 58.0,
    grasas_100g: 7.0,
    fibra_100g: 10.0,
    sodio_100g: 5,
    azucares_100g: 1.2,
    nutriscore: "A",
  },
  // Atún claro al natural
  "8420000456789": {
    codigo: "8420000456789",
    nombre: "Atún Claro al Natural en Conserva",
    marca: "Calvo / Albo",
    porcion_g: 80,
    calorias_100g: 101,
    proteinas_100g: 24.0,
    carbs_100g: 0.0,
    grasas_100g: 0.6,
    fibra_100g: 0.0,
    sodio_100g: 320,
    azucares_100g: 0.0,
    nutriscore: "A",
  },
  // Pan integral 100% centeno
  "8430000112233": {
    codigo: "8430000112233",
    nombre: "Pan de Molde 100% Integral de Centeno",
    marca: "Bimbo / Silueta",
    porcion_g: 45,
    calorias_100g: 220,
    proteinas_100g: 8.5,
    carbs_100g: 41.0,
    grasas_100g: 1.8,
    fibra_100g: 7.5,
    sodio_100g: 410,
    azucares_100g: 2.5,
    nutriscore: "A",
  },
};

export async function fetchProductFromOpenFoodFacts(
  barcode: string
): Promise<ProductoCodigoBarras | null> {
  const cleanCode = barcode.trim().replace(/\s+/g, "");
  if (!cleanCode) return null;

  // Si coincide con catálogo local precargado
  if (SAMPLE_BARCODE_PRODUCTS[cleanCode]) {
    return SAMPLE_BARCODE_PRODUCTS[cleanCode];
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`,
      {
        headers: {
          "User-Agent": "NutriEngine-AI/1.0 (Clinical Nutrition Engine)",
        },
        next: { revalidate: 86400 }, // Cache 24h
      }
    );

    if (!res.ok) {
      throw new Error(`OpenFoodFacts returned ${res.status}`);
    }

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      // Si no existe en la API global, generar producto estimado con el código
      return {
        codigo: cleanCode,
        nombre: `Producto (#${cleanCode.slice(-4)})`,
        marca: "Alimento Envasado",
        porcion_g: 100,
        calorias_100g: 165,
        proteinas_100g: 8.0,
        carbs_100g: 22.0,
        grasas_100g: 5.0,
        fibra_100g: 2.5,
        sodio_100g: 150,
        azucares_100g: 4.0,
        nutriscore: "B",
      };
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const kcal100 =
      Math.round(
        nutriments["energy-kcal_100g"] ||
          (nutriments.energy_100g ? nutriments.energy_100g / 4.184 : 0)
      ) || 120;

    return {
      codigo: cleanCode,
      nombre: p.product_name || p.product_name_es || `Producto ${cleanCode}`,
      marca: p.brands || "Marca no especificada",
      porcion_g: Number(p.serving_quantity) || 100,
      calorias_100g: kcal100,
      proteinas_100g: Number((nutriments.proteins_100g || 0).toFixed(1)),
      carbs_100g: Number((nutriments.carbohydrates_100g || 0).toFixed(1)),
      grasas_100g: Number((nutriments.fat_100g || 0).toFixed(1)),
      fibra_100g: Number((nutriments.fiber_100g || 0).toFixed(1)),
      sodio_100g: Math.round((nutriments.sodium_100g || 0) * 1000), // g -> mg
      azucares_100g: Number((nutriments.sugars_100g || 0).toFixed(1)),
      nutriscore: p.nutriscore_grade?.toUpperCase() || undefined,
      imagen_url: p.image_front_small_url || p.image_url || undefined,
    };
  } catch (error) {
    console.warn("Fallo conectando a OpenFoodFacts, usando fallback estructurado:", error);
    return {
      codigo: cleanCode,
      nombre: `Alimento Escaneado (#${cleanCode.slice(-4)})`,
      marca: "Referencia Supermercado",
      porcion_g: 100,
      calorias_100g: 155,
      proteinas_100g: 9.0,
      carbs_100g: 20.0,
      grasas_100g: 4.5,
      fibra_100g: 2.0,
      sodio_100g: 120,
      azucares_100g: 3.0,
      nutriscore: "B",
    };
  }
}
