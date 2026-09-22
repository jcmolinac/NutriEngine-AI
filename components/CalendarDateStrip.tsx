"use client";

import React, { useState } from "react";
import { Flame, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [weekOffset, setWeekOffset] = useState(0);

  const formatLocalIso = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayIso = React.useMemo(() => formatLocalIso(new Date()), []);

  // Calcular la semana de 7 días (Lunes a Domingo) según weekOffset
  const { days, weekLabel } = React.useMemo(() => {
    const now = new Date();
    // Obtener el Lunes de la semana
    const dayOfWeek = now.getDay(); // 0 es Domingo, 1 es Lunes...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

    const list = [];
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatLocalIso(d);
      const dayNum = d.getDate();
      const isToday = iso === todayIso;

      list.push({
        iso,
        dayName: dayNames[i],
        dayNum,
        isToday,
      });
    }

    const startMonth = monday.toLocaleDateString("es-ES", { month: "short" });
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const endMonth = sunday.toLocaleDateString("es-ES", { month: "short" });

    const label =
      startMonth === endMonth
        ? `${monday.getDate()} - ${sunday.getDate()} ${startMonth}`
        : `${monday.getDate()} ${startMonth} - ${sunday.getDate()} ${endMonth}`;

    return { days: list, weekLabel: label };
  }, [todayIso, weekOffset]);

  // Racha activa
  const streakCount = React.useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = formatLocalIso(d);
      const record = dayRecords[iso];
      if (record && record.calorias > 0) {
        count++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return Math.max(1, count);
  }, [dayRecords]);

  const handleDayClick = (iso: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    onSelectDate(iso);
  };

  const handleGoToToday = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setWeekOffset(0);
    onSelectDate(todayIso);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-3 shadow-sm space-y-2.5">
      {/* Cabecera con selector de semana, racha y botón Ir a Hoy */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
            <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Semana:</span>
            <span className="text-[11px] font-mono text-stone-600 font-bold">{weekLabel}</span>
          </div>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="w-5 h-5 rounded-md hover:bg-stone-100 flex items-center justify-center text-stone-500 active:scale-95 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Semana siguiente"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="w-5 h-5 rounded-md hover:bg-stone-100 flex items-center justify-center text-stone-500 active:scale-95 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(selectedDate !== todayIso || weekOffset !== 0) && (
            <button
              type="button"
              onClick={handleGoToToday}
              className="px-2 py-0.5 rounded-full bg-fitia-yellow hover:bg-[#F5BF00] text-fitia-dark text-[10px] font-black shadow-2xs active:scale-95 transition"
            >
              📍 Ir a Hoy
            </button>
          )}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[11px] font-black">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Racha: {streakCount} {streakCount === 1 ? "día" : "días"}</span>
          </div>
        </div>
      </div>

      {/* Cuadrícula de 7 columnas: encaje 100% perfecto en móvil sin cortes ni scroll */}
      <div className="grid grid-cols-7 gap-1 w-full">
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
              className={`flex flex-col items-center justify-between py-1.5 px-0.5 rounded-2xl w-full h-[66px] transition active:scale-95 border relative ${
                isSelected
                  ? "bg-fitia-dark text-white border-fitia-dark shadow-sm ring-1 ring-fitia-dark"
                  : item.isToday
                  ? "bg-amber-50/70 text-stone-900 border-fitia-yellow shadow-2xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              {/* Badge Hoy */}
              {item.isToday && !isSelected && (
                <span className="absolute -top-1.5 px-1 py-0.2 bg-fitia-yellow text-fitia-dark text-[8px] font-black rounded-full uppercase tracking-tighter shadow-2xs">
                  Hoy
                </span>
              )}

              <span
                className={`text-[10px] font-bold leading-tight ${
                  isSelected
                    ? "text-fitia-yellow"
                    : item.isToday
                    ? "text-amber-800 font-black"
                    : "text-stone-400"
                }`}
              >
                {item.dayName}
              </span>

              <span
                className={`text-sm font-black font-mono leading-none ${
                  item.isToday && !isSelected ? "text-amber-950 font-extrabold" : ""
                }`}
              >
                {item.dayNum}
              </span>

              {/* Indicador de cumplimiento */}
              <div className="flex items-center justify-center h-2">
                {isGoalMet ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : hasLogged ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                ) : item.isToday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-fitia-yellow ring-2 ring-amber-300" />
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
