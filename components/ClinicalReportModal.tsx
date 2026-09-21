"use client";

import React from "react";
import { Printer, X, FileText, Download, CheckCircle2 } from "lucide-react";
import { UserAntropoData, MetasYProgreso, RegistroDiario, RegistroAgua } from "@/types/nutrition";

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserAntropoData;
  metasData: MetasYProgreso;
  registroDiario?: RegistroDiario;
  registroAgua?: RegistroAgua;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  userData,
  metasData,
  registroDiario,
  registroAgua,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const imc = (userData.peso_actual_kg / Math.pow(userData.altura_cm / 100, 2)).toFixed(1);
  const imcMeta = (userData.peso_meta_kg / Math.pow(userData.altura_cm / 100, 2)).toFixed(1);
  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-4xl border border-stone-200 overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Modal Header (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fitia-yellow text-fitia-dark flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-fitia-dark" />
            </div>
            <div>
              <h3 className="text-sm font-black text-fitia-dark">
                Reporte Clínico y Metabólico Oficial
              </h3>
              <span className="text-[10px] text-stone-500 font-medium">
                Listo para compartir con tu Médico o Nutricionista
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-trigger-print"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-fitia-yellow hover:bg-[#F5BF00] text-fitia-dark text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4 text-fitia-dark" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="clinical-report-sheet"
          className="p-6 space-y-5 overflow-y-auto flex-1 font-sans text-stone-900 print:p-0 print:overflow-visible"
        >
          {/* Header del informe */}
          <div className="border-b-2 border-stone-900 pb-3 flex items-start justify-between">
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase text-stone-950">
                NutriEngine AI • Informe de Prescripción Nutricional
              </h1>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Evaluación antropométrica y prescripción dietética basada en evidencia clínica
              </p>
            </div>
            <div className="text-right text-xs text-stone-500 font-mono">
              <p>Fecha: {fechaHoy}</p>
              <p className="text-[10px] text-emerald-700 font-bold">Fórmula: Mifflin-St Jeor (1990)</p>
            </div>
          </div>

          {/* 1. Datos Antropométricos */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-black uppercase text-stone-800 tracking-wider">
              1. Parámetros Biométricos del Paciente
            </h2>
            <div className="grid grid-cols-4 gap-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-400 block text-[10px]">Edad / Género</span>
                <span className="font-bold">{userData.edad} años • {userData.genero}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Estatura</span>
                <span className="font-bold">{userData.altura_cm} cm</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Peso Actual / Meta</span>
                <span className="font-bold">{userData.peso_actual_kg} kg → {userData.peso_meta_kg} kg</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">IMC Actual / Meta</span>
                <span className="font-bold">{imc} → {imcMeta} kg/m²</span>
              </div>
            </div>
          </div>

          {/* 2. Balance Energético y Tasas Metabólicas */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-black uppercase text-stone-800 tracking-wider">
              2. Cálculo del Gasto Energético y Presupuesto
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl border border-stone-200 bg-white">
                <span className="text-[10px] text-stone-400 uppercase block font-bold">BMR Basal</span>
                <span className="text-base font-black font-mono text-stone-900">
                  {metasData.tasa_metabolica_basal_bmr || 1889}
                </span>
                <span className="text-[9px] text-stone-400 block">kcal/día</span>
              </div>

              <div className="p-2.5 rounded-2xl border border-stone-200 bg-white">
                <span className="text-[10px] text-stone-400 uppercase block font-bold">TDEE Total</span>
                <span className="text-base font-black font-mono text-stone-900">
                  {metasData.gasto_energetico_total_tdee || 2267}
                </span>
                <span className="text-[9px] text-stone-400 block">kcal/día ({userData.nivel_actividad})</span>
              </div>

              <div className="p-2.5 rounded-2xl border border-stone-200 bg-amber-50">
                <span className="text-[10px] text-amber-800 uppercase block font-bold">Déficit Diario</span>
                <span className="text-base font-black font-mono text-amber-950">-450</span>
                <span className="text-[9px] text-amber-700 block">kcal (sostenible)</span>
              </div>

              <div className="p-2.5 rounded-2xl border border-emerald-300 bg-emerald-50">
                <span className="text-[10px] text-emerald-800 uppercase block font-bold">Presupuesto</span>
                <span className="text-base font-black font-mono text-emerald-950">
                  {metasData.calorias_diarias_recomendadas}
                </span>
                <span className="text-[9px] text-emerald-700 block">kcal/día recomendadas</span>
              </div>
            </div>
          </div>

          {/* 3. Distribución de Macronutrientes y Micronutrientes */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-black uppercase text-stone-800 tracking-wider">
              3. Distribución de Macro y Micronutrientes Clave
            </h2>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-2xl border border-stone-200 bg-white space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Proteínas</span>
                  <span className="font-mono">{metasData.macros_objetivo?.proteinas_g} g/día</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  1.8 g/kg de peso objetivo ({userData.peso_meta_kg} kg). Preservación muscular en déficit.
                </p>
              </div>

              <div className="p-3 rounded-2xl border border-stone-200 bg-white space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Grasas Saludables</span>
                  <span className="font-mono">{metasData.macros_objetivo?.grasas_g} g/día</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  0.8 g/kg de peso corporal. Soporte endocrino y síntesis de testosterona.
                </p>
              </div>

              <div className="p-3 rounded-2xl border border-stone-200 bg-white space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Carbohidratos</span>
                  <span className="font-mono">{metasData.macros_objetivo?.carbohidratos_g} g/día</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Complejos de bajo índice glucémico y alto contenido de fibra.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100/70 border border-stone-200 text-xs font-medium">
              <span>Fibra Objetivo: <strong>35 g/día</strong> (saciedad y microbiota)</span>
              <span>Límite de Sodio: <strong>&lt; 2,300 mg/día</strong> (tensión arterial)</span>
              <span>Hidratación: <strong>3.3 Litros/día</strong> (filtración renal)</span>
            </div>
          </div>

          {/* 4. Proyección Temporal */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-black uppercase text-stone-800 tracking-wider">
              4. Cronograma Estimado de Reducción Ponderal
            </h2>
            <div className="p-3 rounded-2xl border border-stone-200 bg-white text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span>Pérdida Total Prevista: <strong>-13.0 kg</strong></span>
                <span>Ritmo Sostenible: <strong>~0.5 kg/semana</strong></span>
                <span>Plazo Estimado: <strong>26 semanas (~6 meses)</strong></span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-600 font-mono pt-1 border-t border-stone-100">
                <span>Inicio: {userData.peso_actual_kg} kg</span>
                <span>Semana 7: 91.5 kg</span>
                <span>Semana 14: 88.0 kg</span>
                <span>Semana 20: 84.5 kg</span>
                <span className="font-bold text-emerald-700">Objetivo: {userData.peso_meta_kg} kg</span>
              </div>
            </div>
          </div>

          {/* Firmas y sellos clínicos */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-6 text-xs text-stone-500">
            <div>
              <p className="font-bold text-stone-800">Observaciones del Especialista:</p>
              <div className="h-12 border-b border-dashed border-stone-300 mt-1" />
            </div>
            <div className="text-right">
              <p className="font-bold text-stone-800">Firma / Sello Facultativo:</p>
              <div className="h-12 border-b border-dashed border-stone-300 mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
