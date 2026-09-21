import { UserAntropoData, AjusteAdaptativoTDEE } from "@/types/nutrition";

export interface ControlPesajeSemanal {
  semanaNumero: number;
  pesoRegistradoKg: number;
  promedioCaloriasConsumidas?: number;
}

export function calculateAdaptiveTDEE(params: {
  userData: UserAntropoData;
  presupuestoActual: number;
  pesajesRecientes: ControlPesajeSemanal[];
}): AjusteAdaptativoTDEE {
  const { userData, presupuestoActual, pesajesRecientes } = params;

  const pesoInicial = userData.peso_actual_kg;
  const ultimoPesaje = pesajesRecientes[pesajesRecientes.length - 1];
  const pesoActualRegistrado = ultimoPesaje?.pesoRegistradoKg || pesoInicial;
  const semanasTranscurridas = Math.max(1, ultimoPesaje?.semanaNumero || 1);

  // Pérdida teórica esperada a déficit de ~450-500 kcal/día = ~0.45 kg/semana
  const perdidaEsperadaKg = semanasTranscurridas * 0.45;
  const pesoEsperadoKg = Number((pesoInicial - perdidaEsperadaKg).toFixed(1));

  // Pérdida real acumulada y ritmo por semana
  const perdidaRealKg = pesoInicial - pesoActualRegistrado;
  const tasaRealPorSemana = perdidaRealKg / semanasTranscurridas;

  // Recalcular BMR y TDEE base con el peso actualizado
  const s = userData.genero === "masculino" ? 5 : -161;
  const nuevoBmrBase = Math.round(
    10 * pesoActualRegistrado + 6.25 * userData.altura_cm - 5 * userData.edad + s
  );

  let factorActividad = 1.2;
  const nivel = (userData.nivel_actividad || "sedentario").toLowerCase();
  if (nivel.includes("sedentar")) factorActividad = 1.2;
  else if (nivel.includes("liger")) factorActividad = 1.375;
  else if (nivel.includes("modera")) factorActividad = 1.55;
  else if (nivel.includes("intens")) factorActividad = 1.725;

  let nuevoTdee = Math.round(nuevoBmrBase * factorActividad);
  let nuevoPresupuesto = presupuestoActual;
  let diagnostico = "";

  // Diagnóstico clínico del ritmo de pérdida
  if (tasaRealPorSemana >= 0.35 && tasaRealPorSemana <= 0.75) {
    // Ritmo ideal: 0.35 a 0.75 kg/semana (preservación óptima de masa magra)
    nuevoPresupuesto = Math.max(1200, nuevoTdee - 450);
    diagnostico = `Ritmo de pérdida excelente (${tasaRealPorSemana.toFixed(2)} kg/sem). Adaptación termogénica normal. Se mantiene déficit sostenible de 450 kcal para proteger masa muscular.`;
  } else if (tasaRealPorSemana < 0.2 && semanasTranscurridas >= 2) {
    // Meseta o adaptación metabólica (>2 semanas sin progreso)
    // Reducir levemente presupuesto calórico (-75 kcal) o sugerir aumentar NEAT (pasos diarios)
    nuevoPresupuesto = Math.max(1200, presupuestoActual - 75);
    nuevoTdee = nuevoTdee - 50; // Refleja leve bajada del NEAT espontáneo
    diagnostico = `Meseta metabólica detectada (<0.20 kg/sem). Tu cuerpo redujo el gasto espontáneo (termogénesis adaptativa). Ajustamos -75 kcal/día y recomendamos sumar 2,000 pasos diarios.`;
  } else if (tasaRealPorSemana > 1.0) {
    // Ritmo excesivamente rápido: riesgo de catabolismo proteico y efecto rebote
    nuevoPresupuesto = Math.min(nuevoTdee, presupuestoActual + 150);
    diagnostico = `Pérdida demasiado rápida (${tasaRealPorSemana.toFixed(2)} kg/sem). Riesgo de pérdida de masa muscular y fatiga adrenal. Incrementamos +150 kcal/día para un déficit moderado seguro.`;
  } else {
    nuevoPresupuesto = Math.max(1200, nuevoTdee - 450);
    diagnostico = `Progreso en fase inicial (${tasaRealPorSemana.toFixed(2)} kg/sem). Presupuesto sincronizado con el nuevo peso de ${pesoActualRegistrado} kg.`;
  }

  const hoy = new Date().toISOString().split("T")[0];

  return {
    fecha: hoy,
    peso_real_kg: pesoActualRegistrado,
    peso_esperado_kg: pesoEsperadoKg,
    tdee_anterior: Math.round(nuevoBmrBase * factorActividad),
    nuevo_tdee: nuevoTdee,
    nuevo_presupuesto: nuevoPresupuesto,
    diagnostico,
  };
}
