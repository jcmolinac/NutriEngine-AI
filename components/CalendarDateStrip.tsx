"use client";

import React from "react";
import { Flame, Calendar as CalendarIcon } from "lucide-react";

interface CalendarDateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  dayRecords?: Record<
    string,
    {
      calorias: number;
      objetivoCalorias: number;
    }
  >;
}

export const CalendarDateStrip: React.FC<CalendarDateStripProps> = ({
  selectedDate,
  onSelectDate,
  dayRecords = {},
}) => {
  // Generar los últimos 8 días terminando en hoy
  const days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("es-ES", { weekday: "short" });
      const dayNum = d.getDate();
      const isToday = i === 0;

      list.push({
        iso,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
        dayNum,
        isToday,
      });
    }
    return list;
  }, []);

  // Calcular racha activa (días consecutivos con registros)
  const streakCount = React.useMemo(() => {
    let count = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const record = dayRecords[days[i].iso];
      if (record && record.calorias > 0) {
        count++;
      } else if (i === days.length - 1) {
        // Si hoy aún no tiene registros pero ayer sí, cuenta como en progreso
        continue;
      } else {
        break;
      }
    }
    return Math.max(1, count); // Mínimo 1 de motivación al registrar
  }, [days, dayRecords]);

  const handleDayClick = (iso: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    onSelectDate(iso);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-3 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
          <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
          <span>Calendario de Hábitos</span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[11px] font-black">
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Racha: {streakCount} {streakCount === 1 ? "día" : "días"}</span>
        </div>
      </div>

      {/* Tira horizontal de días */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {days.map((item) => {
          const isSelected = selectedDate === item.iso;
          const rec = dayRecords[item.iso];
          const hasLogged = rec && rec.calorias > 0;
          const isGoalMet =
            hasLogged && Math.abs(rec.calorias - rec.objetivoCalorias) <= 150;

          return (
            <button
              key={item.iso}
              type="button"
              id={`btn-date-${item.iso}`}
              onClick={() => handleDayClick(item.iso)}
              className={`flex flex-col items-center justify-between py-2 px-2.5 rounded-2xl min-w-[46px] h-16 transition active:scale-95 shrink-0 border ${
                isSelected
                  ? "bg-fitia-dark text-white border-fitia-dark shadow-sm"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              <span
                className={`text-[10px] font-bold ${
                  isSelected ? "text-fitia-yellow" : "text-stone-400"
                }`}
              >
                {item.isToday ? "Hoy" : item.dayName}
              </span>

              <span className="text-sm font-black font-mono">
                {item.dayNum}
              </span>

              {/* Indicador de cumplimiento */}
              <div className="flex items-center justify-center h-2">
                {isGoalMet ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : hasLogged ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                ) : (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? "bg-stone-500" : "bg-stone-300"
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
