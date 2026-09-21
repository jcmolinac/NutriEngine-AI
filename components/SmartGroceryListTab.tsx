"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  CheckSquare,
  Square,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { CategoriaCompra } from "@/types/nutrition";

interface SmartGroceryListTabProps {
  groceryData: CategoriaCompra[];
  onRefreshList: () => Promise<void>;
  isProcessing: boolean;
}

export const SmartGroceryListTab: React.FC<SmartGroceryListTabProps> = ({
  groceryData,
  onRefreshList,
  isProcessing,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleItem = (key: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(20);
    }
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItemsCount = groceryData?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0;
  const purchasedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = totalItemsCount > 0 ? Math.round((purchasedCount / totalItemsCount) * 100) : 0;

  const handleCopyText = () => {
    let text = "🛒 *LISTA INTELIGENTE DE COMPRAS SEMANAL - NUTRIENGINE AI*\n\n";
    groceryData?.forEach((cat) => {
      text += `📍 *${cat.categoria}*\n`;
      cat.items?.forEach((it) => {
        text += ` • ${it.alimento}: ${it.cantidad_total}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(30);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-2">
      {/* Header & Progress Card */}
      <div className="bg-fitia-cream rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-fitia-green uppercase tracking-wider">
              Pasillos de Supermercado
            </span>
            <h3 className="text-base font-black text-fitia-dark leading-tight">
              Lista de Compras Inteligente
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-fitia-surface border border-stone-200 text-stone-700 text-xs font-bold font-mono">
            {purchasedCount}/{totalItemsCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Progreso en el carrito</span>
            <span className="font-black text-fitia-dark">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-stone-200/70 overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full rounded-full bg-fitia-yellow transition-all duration-300"
            />
          </div>
        </div>

        {/* Quick action buttons (Min 44px) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            id="btn-copy-grocery-list"
            onClick={handleCopyText}
            className="h-11 min-h-[44px] rounded-2xl bg-fitia-surface hover:bg-stone-200 active:bg-stone-300 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-200 transition"
          >
            {copied ? <Check className="w-4 h-4 text-fitia-green" /> : <Copy className="w-4 h-4 text-stone-500" />}
            <span>{copied ? "¡Copiada!" : "Copiar Lista"}</span>
          </button>

          <button
            type="button"
            id="btn-refresh-grocery-list"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(25);
              }
              onRefreshList();
            }}
            disabled={isProcessing}
            className="h-11 min-h-[44px] rounded-2xl bg-fitia-yellow hover:bg-[#F5BF00] active:scale-98 text-fitia-dark text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
            <span>{isProcessing ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>
      </div>

      {/* Categories by Supermarket Aisle */}
      {!groceryData || groceryData.length === 0 ? (
        <div className="bg-white rounded-4xl border border-dashed border-stone-300 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-fitia-yellow/30 text-fitia-dark flex items-center justify-center mx-auto">
            <ShoppingCart className="w-6 h-6 text-fitia-dark" />
          </div>
          <div>
            <h4 className="text-sm font-black text-fitia-dark">Lista de Compras Vacía</h4>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Genera primero tu plan de comidas en la pestaña <strong>Plan</strong> y haz clic en <strong>Generar Lista de Compras</strong> para ver tus ingredientes agrupados por pasillo.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groceryData.map((cat, catIdx) => (
            <div
              key={catIdx}
              className="bg-white rounded-4xl border border-stone-200/90 p-4 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-fitia-green" />
                  <h4 className="text-sm font-bold text-fitia-dark">{cat.categoria}</h4>
                </div>
                <span className="text-[10px] text-stone-400 font-semibold font-mono">
                  {cat.items?.length || 0} ítems
                </span>
              </div>

              <div className="space-y-1.5">
                {cat.items?.map((it, itemIdx) => {
                  const itemKey = `${cat.categoria}-${it.alimento}-${itemIdx}`;
                  const isChecked = !!checkedItems[itemKey];

                  return (
                    <button
                      key={itemIdx}
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      className={`w-full p-3 rounded-2xl text-left flex items-center justify-between gap-3 min-h-[48px] transition border ${
                        isChecked
                          ? "bg-stone-50 border-stone-200 opacity-60 line-through text-stone-400"
                          : "bg-white border-stone-150 hover:bg-fitia-surface active:bg-fitia-yellow/20 text-stone-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-fitia-green" />
                          ) : (
                            <Square className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <span className="text-xs font-bold leading-tight">{it.alimento}</span>
                      </div>

                      <span className="text-xs font-mono font-bold text-stone-600 bg-fitia-surface px-2 py-0.5 rounded-lg shrink-0 border border-stone-200/60">
                        {it.cantidad_total}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
