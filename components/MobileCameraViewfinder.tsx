"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, RefreshCw, Zap, ZapOff, Camera, AlertCircle, UploadCloud, Barcode, Utensils } from "lucide-react";

interface MobileCameraViewfinderProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const MobileCameraViewfinder: React.FC<MobileCameraViewfinderProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<"comidas" | "codigo_barras">("comidas");
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setErrorMessage(null);
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((e) => console.warn("Video play error:", e));
        }

        const track = mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as any;
        if (capabilities?.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      } catch (err: any) {
        console.warn("Camera init error:", err);
        if (isMounted) {
          setHasPermission(false);
          setErrorMessage(
            "No se pudo acceder a la cámara trasera. Puedes seleccionar una foto de tu galería."
          );
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [isOpen, cameraFacing, stopStream]);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.warn("Torch toggle not supported on this device", e);
    }
  };

  const flipCamera = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([40, 20, 60]);
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const originalWidth = video.videoWidth || 1280;
      const originalHeight = video.videoHeight || 720;

      // Optimización de resolución (max 1024px) para evitar payloads pesados y agilizar respuesta de IA
      const MAX_DIM = 1024;
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (originalWidth > originalHeight) {
        if (originalWidth > MAX_DIM) {
          targetHeight = Math.round((originalHeight * MAX_DIM) / originalWidth);
          targetWidth = MAX_DIM;
        }
      } else {
        if (originalHeight > MAX_DIM) {
          targetWidth = Math.round((originalWidth * MAX_DIM) / originalHeight);
          targetHeight = MAX_DIM;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        stopStream();
        onCapture(dataUrl);
        onClose();
      }
    } catch (err) {
      console.error("Capture snapshot failed:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(30);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const img = new window.Image();
        img.onload = () => {
          const canvas = canvasRef.current || document.createElement("canvas");
          const MAX_DIM = 1024;
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const optimized = canvas.toDataURL("image/jpeg", 0.82);
            stopStream();
            onCapture(optimized);
            onClose();
            return;
          }
          stopStream();
          onCapture(reader.result as string);
          onClose();
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      id="mobile-camera-viewfinder"
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none touch-none animate-in fade-in duration-200"
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Barra superior con Safe Area Top */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          aria-label="Cerrar cámara"
          className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-neutral-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-neutral-800 transition active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Indicador de modo */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 text-xs font-semibold text-fitia-yellow">
          <span className="w-2 h-2 rounded-full bg-fitia-yellow animate-ping" />
          <span>{scanMode === "comidas" ? "Escaneo de Comidas" : "Código de Barras"}</span>
        </div>

        {/* Herramientas (Linterna + Voltear) */}
        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              aria-label="Alternar linterna"
              className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-full backdrop-blur-md flex items-center justify-center transition active:scale-95 ${
                torchOn ? "bg-fitia-yellow text-fitia-dark font-bold" : "bg-neutral-900/80 text-white"
              }`}
            >
              {torchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={flipCamera}
            aria-label="Cambiar cámara"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-neutral-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-neutral-800 transition active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewport de video con recorte central */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {hasPermission === false ? (
          <div className="p-6 text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Acceso a Cámara Limitado</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {errorMessage || "El navegador no permitió el acceso al sensor de video."}
            </p>
            <button
              type="button"
              onClick={() => fileFallbackRef.current?.click()}
              className="w-full h-12 min-h-[44px] rounded-full bg-fitia-yellow text-fitia-dark text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Subir Foto del Plato</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Máscara oscura perimetral con recorte central redondeado */}
            {scanMode === "comidas" ? (
              <div className="relative z-10 w-[82vw] max-w-[320px] aspect-square rounded-[36px] border-2 border-fitia-yellow/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.58)] pointer-events-none flex flex-col items-center justify-between p-4 transition-all">
                {/* Esquinas guía */}
                <div className="w-full flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-fitia-yellow -mt-1 -ml-1 rounded-tl-xl" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-fitia-yellow -mt-1 -mr-1 rounded-tr-xl" />
                </div>

                {/* Retícula central */}
                <div className="relative w-16 h-16 flex items-center justify-center opacity-70">
                  <div className="w-px h-10 bg-fitia-yellow" />
                  <div className="h-px w-10 bg-fitia-yellow absolute" />
                  <div className="w-4 h-4 rounded-full border border-fitia-yellow absolute" />
                </div>

                <div className="w-full flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-fitia-yellow -mb-1 -ml-1 rounded-bl-xl" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-fitia-yellow -mb-1 -mr-1 rounded-br-xl" />
                </div>
              </div>
            ) : (
              <div className="relative z-10 w-[85vw] max-w-[320px] h-48 rounded-2xl border-2 border-fitia-yellow shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none flex flex-col items-center justify-center transition-all">
                {/* Línea láser de escaneo animada */}
                <div className="w-full h-0.5 bg-fitia-yellow animate-pulse shadow-[0_0_8px_#FFC800]" />
              </div>
            )}

            {/* Micro-guía contextual */}
            <div className="absolute top-5 z-10 px-4 py-2 rounded-full bg-neutral-900/85 backdrop-blur-md border border-white/10 text-center shadow-lg pointer-events-none">
              <p className="text-xs font-semibold text-neutral-100">
                {scanMode === "comidas"
                  ? "Encuadra el plato completo dentro del marco"
                  : "Apunta al código de barras del producto"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Controles inferiores: Selector de píldora + Disparador */}
      <div className="relative z-20 pb-[max(1.8rem,env(safe-area-inset-bottom))] pt-3 px-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col items-center gap-3">
        {/* Selector inferior tipo píldora para alternar "Comidas" y "Código de barras" */}
        <div className="flex items-center p-1 rounded-full bg-neutral-900/85 backdrop-blur-md border border-neutral-700/80 shadow-md">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(20);
              }
              setScanMode("comidas");
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              scanMode === "comidas"
                ? "bg-fitia-yellow text-fitia-dark shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Comidas</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate?.(20);
              }
              setScanMode("codigo_barras");
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              scanMode === "codigo_barras"
                ? "bg-fitia-yellow text-fitia-dark shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Código de barras</span>
          </button>
        </div>

        {/* Fila del Disparador */}
        <div className="w-full flex items-center justify-around">
          {/* Subir foto de galería */}
          <button
            type="button"
            onClick={() => fileFallbackRef.current?.click()}
            aria-label="Abrir galería de fotos"
            className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full bg-neutral-800/80 backdrop-blur-md text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition"
          >
            <UploadCloud className="w-5 h-5" />
          </button>

          {/* Botón Central Disparador */}
          <button
            id="btn-camera-shutter"
            type="button"
            onClick={capturePhoto}
            disabled={hasPermission === false || isCapturing}
            aria-label="Tomar fotografía del plato"
            className="relative w-20 h-20 min-h-[44px] min-w-[44px] rounded-full p-1 bg-white ring-4 ring-fitia-yellow/50 active:scale-90 active:ring-fitia-yellow transition-all duration-150 flex items-center justify-center disabled:opacity-40 shadow-xl"
          >
            <div className="w-full h-full rounded-full bg-fitia-yellow flex items-center justify-center shadow-inner">
              <Camera className="w-8 h-8 text-fitia-dark" />
            </div>
          </button>

          {/* Cancelar / Salir */}
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            aria-label="Cancelar captura"
            className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full bg-neutral-800/80 backdrop-blur-md text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition text-xs font-semibold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <input
        ref={fileFallbackRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFallbackFile}
      />
    </div>
  );
};
