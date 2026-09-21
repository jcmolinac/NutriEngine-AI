// components/FitiaButton.tsx
import React from "react";

interface FitiaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function FitiaButton({ children, className = "", ...props }: FitiaButtonProps) {
  return (
    <button
      {...props}
      className={`w-full rounded-full bg-fitia-yellow py-4 text-center text-base font-bold text-fitia-dark shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
