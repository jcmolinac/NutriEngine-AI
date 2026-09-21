"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ScanBarcode,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Sparkles,
  Camera,
} from "lucide-react";
import { ProductoCodigoBarras } from "@/types/nutrition";
import { SAMPLE_BARCODE_PRODUCTS } from "@/lib/open-food-facts";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (
    item: {
      nombre: string;
      peso_g: number;
      calorias: number;
      proteinas_g: number;
      carbohidratos_g: number;
      grasas_g: number;
      fibra_g?: number;
      sodio_mg?: number;
    },
    mealTime: "Desayuno" | "Comida" | "Cena" | "Snack"
  ) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
}) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductoCodigoBarras | null>(null);
  const [grams, setGrams] = useState(100);
  const [selectedMealTime, setSelectedMealTime] = useState<
    "Desayuno" | "Comida" | "Cena" | "Snack"
  >("Comida");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Intentar inicializar BarcodeDetector si está disponible en el navegador
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setProduct(null);
      setError(null);
      setBarcodeInput("");
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Si BarcodeDetector existe nativamente en window
        if ("BarcodeDetector" in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
          });

          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && !isLoading && !product) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const detected = barcodes[0].rawValue;
                  if (detected) {
                    if (typeof window !== "undefined" && "vibrate" in navigator) {
                      navigator.vibrate?.([30, 50, 30]);
                    }
                    handleLookup(detected);
                  }
                }
              } catch (e) {
                // Ignore detection frame errors
              }
            }
          }, 600);
        }
      }
    } catch (err) {
      console.warn("Cámara no disponible para escáner de código de barras:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleLookup = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(clean)}`);
      if (!res.ok) {
        throw new Error("Producto no encontrado");
      }
      const data: ProductoCodigoBarras = await res.json();
      setProduct(data);
      setGrams(data.porcion_g || 100);
      stopCamera();
    } catch (err: any) {
      setError("No encontramos el producto en la base de datos. Puedes introducir los datos manualmente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (code: string) => {
    setBarcodeInput(code);
    handleLookup(code);
  };

  const handleConfirmAdd = () => {
    if (!product) return;
    const ratio = grams / 100;
    const itemToAdd = {
      nombre: `${product.nombre} (${product.marca})`,
      peso_g: grams,
      calorias: Math.round(product.calorias_100g * ratio),
      proteinas_g: Number((product.proteinas_100g * ratio).toFixed(1)),
      carbohidratos_g: Number((product.carbs_100g * ratio).toFixed(1)),
      grasas_g: Number((product.grasas_100g * ratio).toFixed(1)),
      fibra_g: product.fibra_100g ? Number((product.fibra_100g * ratio).toFixed(1)) : undefined,
      sodio_mg: product.sodio_100g ? Math.round(product.sodio_100g * ratio) : undefined,
    };

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(30);
    }

    onAddMeal(itemToAdd, selectedMealTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-white rounded-4xl border border-stone-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fitia-yellow text-fitia-dark flex items-center justify-center font-bold">
              <ScanBarcode className="w-5 h-5 text-fitia-dark" />
            </div>
            <div>
              <h3 className="text-sm font-black text-fitia-dark">
                Escáner de Código de Barras
              </h3>
              <span className="text-[10px] text-stone-500 font-medium">
                Alimentos Envasados • OpenFoodFacts
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-barcode-modal"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Cámara Viewfinder */}
          {!product && (
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border border-stone-800 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Laser overlay animation */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-28 border-2 border-dashed border-fitia-yellow/80 rounded-2xl relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                </div>
                <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-full mt-2 font-medium">
                  Centra el código de barras (EAN-13 / UPC)
                </span>
              </div>
            </div>
          )}

          {/* Formulario de búsqueda manual */}
          {!product && (
            <div className="space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup(barcodeInput);
                }}
                className="flex gap-1.5"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="input-barcode-manual"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Escribe código (ej. 8480000123456)..."
                    className="w-full h-11 px-3 text-xs font-mono font-semibold rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-fitia-yellow"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-search-barcode"
                  disabled={isLoading || !barcodeInput.trim()}
                  className="px-4 h-11 rounded-2xl bg-fitia-yellow text-fitia-dark text-xs font-black flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 transition"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-fitia-dark" />
                  ) : (
                    <Search className="w-4 h-4 text-fitia-dark" />
                  )}
                  <span>Buscar</span>
                </button>
              </form>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Chips de productos comunes de prueba */}
              <div className="pt-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                  Probar Códigos Frecuentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(SAMPLE_BARCODE_PRODUCTS).map((p) => (
                    <button
                      key={p.codigo}
                      type="button"
                      onClick={() => handleApplyPreset(p.codigo)}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-fitia-yellow/30 text-stone-700 text-[11px] font-semibold transition"
                    >
                      {p.nombre.split(" ")[0]} {p.nombre.split(" ")[1] || ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ficha del Producto Encontrado */}
          {product && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      Producto Verificado ✓
                    </span>
                    <h4 className="text-sm font-black text-fitia-dark leading-tight mt-0.5">
                      {product.nombre}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">{product.marca}</p>
                  </div>

                  {product.nutriscore && (
                    <span className="px-2 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black">
                      Nutri-Score {product.nutriscore}
                    </span>
                  )}
                </div>

                {/* Tabla de macros ajustada a los gramos seleccionados */}
                <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                  <div className="p-2 rounded-2xl bg-white border border-stone-200">
                    <span className="text-[9px] font-bold text-stone-400 block">Calorías</span>
                    <span className="text-sm font-black text-fitia-dark font-mono">
                      {Math.round(product.calorias_100g * (grams / 100))}
                    </span>
                    <span className="text-[9px] text-stone-400 block">kcal</span>
                  </div>

                  <div className="p-2 rounded-2xl bg-white border border-stone-200">
                    <span className="text-[9px] font-bold text-macro-protein block">Proteínas</span>
                    <span className="text-sm font-black text-fitia-dark font-mono">
                      {(product.proteinas_100g * (grams / 100)).toFixed(1)}g
                    </span>
                  </div>

                  <div className="p-2 rounded-2xl bg-white border border-stone-200">
                    <span className="text-[9px] font-bold text-[#A86F28] block">Carbos</span>
                    <span className="text-sm font-black text-fitia-dark font-mono">
                      {(product.carbs_100g * (grams / 100)).toFixed(1)}g
                    </span>
                  </div>

                  <div className="p-2 rounded-2xl bg-white border border-stone-200">
                    <span className="text-[9px] font-bold text-[#635F2B] block">Grasas</span>
                    <span className="text-sm font-black text-fitia-dark font-mono">
                      {(product.grasas_100g * (grams / 100)).toFixed(1)}g
                    </span>
                  </div>
                </div>

                {/* Micronutrientes Fibra y Sodio */}
                {(product.fibra_100g !== undefined || product.sodio_100g !== undefined) && (
                  <div className="flex items-center justify-between text-[11px] text-stone-600 px-1 pt-1 border-t border-amber-200/60">
                    <span>
                      Fibra: <strong>{(Number(product.fibra_100g || 0) * (grams / 100)).toFixed(1)} g</strong>
                    </span>
                    <span>
                      Sodio: <strong>{Math.round(Number(product.sodio_100g || 0) * (grams / 100))} mg</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Selector de gramos y tiempo de comida */}
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Cantidad consumida (gramos):
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      id="input-barcode-grams"
                      value={grams}
                      min={10}
                      max={1000}
                      step={5}
                      onChange={(e) => setGrams(Math.max(10, Number(e.target.value)))}
                      className="w-24 h-10 px-3 text-sm font-bold font-mono rounded-xl border border-stone-300 bg-white text-center"
                    />
                    <span className="text-xs text-stone-500 font-medium">gramos</span>

                    {/* Porciones comunes */}
                    <div className="flex gap-1 ml-auto">
                      {[50, 100, 125, 200].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrams(g)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                            grams === g
                              ? "bg-fitia-dark text-white border-fitia-dark"
                              : "bg-stone-100 text-stone-600 border-stone-200"
                          }`}
                        >
                          {g}g
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Añadir a comida:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["Desayuno", "Comida", "Cena", "Snack"] as const).map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedMealTime(time)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition border ${
                          selectedMealTime === time
                            ? "bg-fitia-yellow text-fitia-dark border-fitia-yellow shadow-xs"
                            : "bg-stone-50 text-stone-600 border-stone-200"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setProduct(null);
                    startCamera();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  Escanear Otro
                </button>

                <button
                  type="button"
                  id="btn-confirm-add-barcode-meal"
                  onClick={handleConfirmAdd}
                  className="flex-1 py-3 rounded-2xl bg-fitia-yellow text-fitia-dark text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  <Plus className="w-4 h-4 text-fitia-dark" />
                  <span>Añadir a {selectedMealTime}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
