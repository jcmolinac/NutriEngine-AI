"use client";

import React, { useState } from "react";
import { X, Mail, Lock, LogIn, UserPlus, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; email: string; nombre?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(25);
    }

    const supabase = getSupabaseBrowserClient();

    // Si Supabase no está configurado en .env, permitimos una sesión local demostrativa aislada
    if (!supabase || !isSupabaseConfigured()) {
      setTimeout(() => {
        setIsLoading(false);
        const demoUserId = "demo-user-" + btoa(email).slice(0, 12);
        onAuthSuccess({
          id: demoUserId,
          email: email.trim(),
          nombre: nombre.trim() || email.split("@")[0],
        });
        onClose();
      }, 500);
      return;
    }

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            nombre: data.user.user_metadata?.nombre || email.split("@")[0],
          });
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              nombre: nombre.trim() || email.split("@")[0],
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setSuccessMessage("¡Cuenta creada con éxito! Iniciando sesión...");
          setTimeout(() => {
            onAuthSuccess({
              id: data.user!.id,
              email: data.user!.email || email,
              nombre: nombre.trim() || email.split("@")[0],
            });
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      console.warn("Error en autenticación:", err);
      setErrorMessage(
        err.message?.includes("Invalid login")
          ? "Credenciales incorrectas. Verifica tu email y contraseña."
          : err.message || "Error al procesar la solicitud."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-sm bg-white rounded-4xl border border-stone-200 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fitia-yellow text-fitia-dark flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-fitia-dark" />
            </div>
            <div>
              <h3 className="text-sm font-black text-fitia-dark">Tu Cuenta NutriEngine</h3>
              <p className="text-[10px] text-stone-500 font-medium">Aislamiento de datos en la nube</p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-auth-modal"
            onClick={onClose}
            aria-label="Cerrar modal de autenticación"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestaña: Login / Registro */}
        <div className="grid grid-cols-2 p-2 bg-stone-100/70 border-b border-stone-100 gap-1 text-xs font-bold">
          <button
            type="button"
            id="tab-auth-login"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-white text-fitia-dark shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            id="tab-auth-register"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-white text-fitia-dark shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Body & Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Tu Nombre:</label>
              <input
                type="text"
                id="input-auth-name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Molina"
                className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-fitia-yellow"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-stone-600 block mb-1">Correo Electrónico:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="email"
                id="input-auth-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full h-11 pl-9 pr-3 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-fitia-yellow"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-600 block mb-1">Contraseña:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="password"
                id="input-auth-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-11 pl-9 pr-3 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-fitia-yellow"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-auth"
            disabled={isLoading}
            className="w-full h-11 rounded-2xl bg-fitia-yellow text-fitia-dark text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Verificando...</span>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión Segura</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta y Comenzar</span>
              </>
            )}
          </button>

          {/* Opción de Modo Invitado */}
          <div className="pt-2 text-center">
            <button
              type="button"
              id="btn-continue-as-guest"
              onClick={onClose}
              className="text-[11px] text-stone-500 hover:text-stone-800 font-semibold underline underline-offset-2"
            >
              Continuar como Invitado (Datos locales en este teléfono)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
