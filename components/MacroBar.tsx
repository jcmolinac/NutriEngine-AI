interface MacroBarProps {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export function MacroBar({ proteinPct, carbsPct, fatPct }: MacroBarProps) {
  return (
    <div className="w-full space-y-2.5">
      {/* Barra continua segmentada */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div style={{ width: `${proteinPct}%` }} className="bg-macro-protein transition-all duration-500" />
        <div style={{ width: `${carbsPct}%` }} className="bg-macro-carbs transition-all duration-500" />
        <div style={{ width: `${fatPct}%` }} className="bg-macro-fat transition-all duration-500" />
      </div>

      {/* Leyenda con indicadores circulares */}
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-macro-protein" />
          Proteínas {proteinPct}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-macro-carbs" />
          Carbs {carbsPct}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-macro-fat" />
          Grasas {fatPct}%
        </span>
      </div>
    </div>
  );
}
