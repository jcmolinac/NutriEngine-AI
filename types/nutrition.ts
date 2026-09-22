export type AccionEjecutada =
  | "SCAN_FOOD"
  | "LOG_DIARY_TEXT_OR_VOICE"
  | "CALCULATE_TARGETS_AND_TIMELINE"
  | "MEAL_PLANNER"
  | "SMART_GROCERY_LIST"
  | "COACH_ADVICE";

export interface FuenteVerificada {
  base_datos: "BEDCA" | "USDA" | "OPENFOODFACTS" | "AI_ESTIMATED";
  codigo_referencia?: string;
  nombre_oficial?: string;
  similitud: number;
}

export interface IngredienteEscaneado {
  alimento: string;
  peso_estimado_g: number;
  peso_g?: number;
  calorias: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  fibra_g?: number;
  sodio_mg?: number;
  hierro_mg?: number;
  azucares_g?: number;
  fuente_verificada?: FuenteVerificada;
}

export type IngredienteReconocido = IngredienteEscaneado;

export interface ControlCalidad {
  alimento_dentro_del_marco: boolean;
  ingredientes_visibles: boolean;
  advertencia_precision: string | null;
  referencia_plato_cm?: number;
  volumen_estimado_cm3?: number;
  grasa_coccion_detectada?: boolean;
}

export interface MacronutrientesEscaneo {
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  porcentaje_proteinas: number;
  porcentaje_carbohidratos: number;
  porcentaje_grasas: number;
  fibra_total_g?: number;
  sodio_total_mg?: number;
  hierro_total_mg?: number;
  azucares_total_g?: number;
}

export interface EscaneoComida {
  nombre_plato: string | null;
  peso_total_preparado_g: number;
  peso_g?: number;
  calorias_totales: number;
  metodo_coccion_inferido?: string;
  puntuacion_confianza?: number;
  micro_preguntas_confirmacion?: string[];
  alternativas_posibles?: string[];
  fuente_verificada_principal?: FuenteVerificada;
  macronutrientes: MacronutrientesEscaneo;
  ingredientes: IngredienteEscaneado[];
  control_calidad: ControlCalidad;
  consejo_coach: string | null;
}

export interface ItemDiario {
  alimento: string;
  porcion_estimada: string;
  peso_g?: number;
  calorias: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  fibra_g?: number;
  sodio_mg?: number;
  azucares_g?: number;
}

export type TiempoComida = "Desayuno" | "Comida" | "Cena" | "Snack" | null;

export interface RegistroDiario {
  tiempo_comida: TiempoComida;
  descripcion_original: string | null;
  items_reconocidos: ItemDiario[];
  total_calorias: number;
}

export interface HitoProgreso {
  etiqueta: string;
  fecha_estimada: string;
  peso_proyectado_kg: number;
}

export interface MetasYProgreso {
  tasa_metabolica_basal_bmr?: number;
  gasto_energetico_total_tdee?: number;
  calorias_diarias_recomendadas: number;
  rango_calorico: {
    min: number;
    max: number;
  };
  macros_objetivo: {
    proteinas_g: number;
    carbohidratos_g: number;
    grasas_g: number;
  };
  curva_progreso: HitoProgreso[];
}

export interface ComidaPlan {
  tipo: "Desayuno" | "Almuerzo" | "Cena";
  nombre_receta: string;
  tiempo_preparacion_min: number;
  calorias: number;
  proteinas_g: number;
  carbs_g: number;
  grasas_g: number;
}

export interface DiaPlan {
  dia: "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes" | "Sabado" | "Domingo";
  resumen_dia: {
    calorias: number;
    proteinas_g: number;
    carbs_g: number;
    grasas_g: number;
  };
  comidas: ComidaPlan[];
}

export interface PlanComidas {
  dias: DiaPlan[];
}

export interface CategoriaCompra {
  categoria: string;
  items: Array<{
    alimento: string;
    cantidad_total: string;
  }>;
}

export interface SugerenciaAyuno {
  protocolo: string;
  ventana_ingesta: string;
  recomendacion: string;
}

export interface ModuloCoach {
  respuesta_consulta: string | null;
  sugerencia_ayuno: SugerenciaAyuno;
}

export interface RegistroAgua {
  meta_ml: number;
  consumido_ml: number;
  vasos_registrados: Array<{ hora: string; ml: number }>;
}

export interface EstadoAyuno {
  protocolo: "16:8" | "14:10" | "18:6" | "20:4";
  hora_inicio_ayuno: string;
  horas_ayuno: number;
  hora_fin_ventana: string;
  en_ayuno: boolean;
}

export interface HistorialDia {
  fecha: string;
  calorias: number;
  objetivo_calorias: number;
  agua_ml: number;
  meta_cumplida: boolean;
  items_count: number;
}

export interface ProductoCodigoBarras {
  codigo: string;
  nombre: string;
  marca: string;
  porcion_g: number;
  calorias_100g: number;
  proteinas_100g: number;
  carbs_100g: number;
  grasas_100g: number;
  fibra_100g?: number;
  sodio_100g?: number;
  azucares_100g?: number;
  nutriscore?: string;
  imagen_url?: string;
}

export interface AjusteAdaptativoTDEE {
  fecha: string;
  peso_real_kg: number;
  peso_esperado_kg: number;
  tdee_anterior: number;
  nuevo_tdee: number;
  nuevo_presupuesto: number;
  diagnostico: string;
}

export interface NutriEngineOutput {
  accion_ejecutada: AccionEjecutada;
  escaneo_comida: EscaneoComida;
  registro_diario: RegistroDiario;
  metas_y_progreso: MetasYProgreso;
  perfil_usuario?: UserAntropoData | null;
  plan_comidas: PlanComidas;
  lista_compras: CategoriaCompra[];
  modulo_coach: ModuloCoach;
  registro_agua?: RegistroAgua;
  estado_ayuno?: EstadoAyuno;
  historial_dias?: Record<string, RegistroDiario>;
  ajustes_adaptativos?: AjusteAdaptativoTDEE[];
}

export interface UserAntropoData {
  edad: number;
  genero: "masculino" | "femenino";
  peso_actual_kg: number;
  altura_cm: number;
  nivel_actividad: "sedentario" | "ligero" | "moderado" | "intenso";
  peso_meta_kg: number;
}
