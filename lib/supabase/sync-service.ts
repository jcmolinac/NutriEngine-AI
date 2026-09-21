import { getSupabaseBrowserClient } from "./client";
import { NutriEngineOutput, UserAntropoData, MetasYProgreso, ItemDiario } from "@/types/nutrition";

export async function loadUserDataFromCloud(
  userId: string
): Promise<Partial<NutriEngineOutput> | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !userId) return null;

  try {
    // 1. Cargar perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.warn("Error cargando perfil desde Supabase:", profileError.message);
      return null;
    }

    // 2. Cargar comidas de hoy
    const hoy = new Date().toISOString().split("T")[0];
    const { data: meals } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("fecha", hoy);

    // 3. Cargar agua de hoy
    const { data: waterLog } = await supabase
      .from("water_logs")
      .select("ml_consumidos")
      .eq("user_id", userId)
      .eq("fecha", hoy)
      .maybeSingle();

    const output: Partial<NutriEngineOutput> = {};

    if (profile) {
      output.metas_y_progreso = {
        tasa_metabolica_basal_bmr: profile.bmr_kcal,
        gasto_energetico_total_tdee: profile.tdee_kcal,
        calorias_diarias_recomendadas: profile.presupuesto_kcal,
        rango_calorico: {
          min: profile.presupuesto_kcal - 100,
          max: profile.presupuesto_kcal + 100,
        },
        macros_objetivo: {
          proteinas_g: profile.proteinas_meta_g,
          carbohidratos_g: profile.carbos_meta_g,
          grasas_g: profile.grasas_meta_g,
        },
        curva_progreso: [
          {
            etiqueta: "Inicio",
            fecha_estimada: hoy,
            peso_proyectado_kg: Number(profile.peso_actual_kg),
          },
          {
            etiqueta: "Meta Final",
            fecha_estimada: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
            peso_proyectado_kg: Number(profile.peso_meta_kg),
          },
        ],
      };

      output.registro_agua = {
        meta_ml: profile.agua_meta_ml || 3300,
        consumido_ml: waterLog?.ml_consumidos || 0,
        vasos_registrados: [],
      };
    }

    if (meals && meals.length > 0) {
      const items: ItemDiario[] = meals.map((m) => ({
        alimento: m.alimento,
        porcion_estimada: `${m.peso_g}g`,
        peso_g: m.peso_g,
        calorias: m.calorias,
        proteinas_g: m.proteinas_g,
        carbohidratos_g: m.carbohidratos_g,
        grasas_g: m.grasas_g,
        fibra_g: m.fibra_g,
        sodio_mg: m.sodio_mg,
      }));

      const totalKcal = items.reduce((acc, it) => acc + (it.calorias || 0), 0);
      output.registro_diario = {
        tiempo_comida: "Comida",
        descripcion_original: "Sincronizado desde la nube",
        items_reconocidos: items,
        total_calorias: totalKcal,
      };
    }

    return output;
  } catch (err) {
    console.warn("Fallo sincronizando desde la nube:", err);
    return null;
  }
}

export async function saveProfileToCloud(
  userId: string,
  data: UserAntropoData,
  metas: MetasYProgreso
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        edad: data.edad,
        genero: data.genero,
        peso_actual_kg: data.peso_actual_kg,
        altura_cm: data.altura_cm,
        nivel_actividad: data.nivel_actividad,
        peso_meta_kg: data.peso_meta_kg,
        bmr_kcal: metas.tasa_metabolica_basal_bmr || 1800,
        tdee_kcal: metas.gasto_energetico_total_tdee || 2200,
        presupuesto_kcal: metas.calorias_diarias_recomendadas,
        proteinas_meta_g: metas.macros_objetivo?.proteinas_g || 140,
        carbos_meta_g: metas.macros_objetivo?.carbohidratos_g || 150,
        grasas_meta_g: metas.macros_objetivo?.grasas_g || 60,
        agua_meta_ml: Math.round(data.peso_actual_kg * 35),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return !error;
  } catch (err) {
    console.warn("Error guardando perfil en nube:", err);
    return false;
  }
}
