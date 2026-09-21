"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeightClass?: string;
  showCloseButton?: boolean;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeightClass = "max-h-[88dvh]",
  showCloseButton = true,
}) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentTranslateY, setCurrentTranslateY] = useState<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      setCurrentTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentTranslateY > 120) {
      onClose();
    }
    setCurrentTranslateY(0);
    setStartY(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        style={{
          transform: `translateY(${currentTranslateY}px)`,
          transition: startY ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`relative w-full max-w-md mx-auto bg-white rounded-t-4xl shadow-2xl flex flex-col overflow-hidden ${maxHeightClass} pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300`}
      >
        {/* Drag Handle Bar */}
        <div
          className="w-full pt-3 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Header if title provided */}
        {(title || showCloseButton) && (
          <div className="px-5 py-2.5 border-b border-stone-100 flex items-center justify-between gap-3 shrink-0">
            <div>
              {title && <h3 className="text-base font-bold text-stone-900 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-stone-100 hover:bg-stone-200 active:bg-stone-300 flex items-center justify-center text-stone-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content with smooth native touch scroll */}
        <div className="flex-1 overflow-y-auto overscroll-y-none px-5 py-4 mobile-scroll">
          {children}
        </div>
      </div>
    </div>
  );
};
