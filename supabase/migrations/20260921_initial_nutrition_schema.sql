-- ====================================================================
-- NUTRIENGINE AI - DATABASE SCHEMA (POSTGRESQL + ROW LEVEL SECURITY)
-- ====================================================================

-- 1. Profiles & Anthropometric Data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  edad INTEGER NOT NULL CHECK (edad >= 10 AND edad <= 120),
  genero TEXT NOT NULL CHECK (genero IN ('masculino', 'femenino')),
  peso_actual_kg NUMERIC(5, 2) NOT NULL,
  altura_cm NUMERIC(5, 2) NOT NULL,
  nivel_actividad TEXT NOT NULL CHECK (nivel_actividad IN ('sedentario', 'ligero', 'moderado', 'intenso')),
  peso_meta_kg NUMERIC(5, 2) NOT NULL,
  bmr_kcal INTEGER NOT NULL,
  tdee_kcal INTEGER NOT NULL,
  presupuesto_kcal INTEGER NOT NULL,
  proteinas_meta_g INTEGER NOT NULL,
  carbos_meta_g INTEGER NOT NULL,
  grasas_meta_g INTEGER NOT NULL,
  agua_meta_ml INTEGER DEFAULT 3300,
  protocolo_ayuno TEXT DEFAULT '16:8',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Daily Meals Log
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tiempo_comida TEXT NOT NULL CHECK (tiempo_comida IN ('Desayuno', 'Comida', 'Cena', 'Snack')),
  alimento TEXT NOT NULL,
  peso_g NUMERIC(6, 2) NOT NULL DEFAULT 100,
  calorias INTEGER NOT NULL,
  proteinas_g NUMERIC(5, 2) NOT NULL DEFAULT 0,
  carbohidratos_g NUMERIC(5, 2) NOT NULL DEFAULT 0,
  grasas_g NUMERIC(5, 2) NOT NULL DEFAULT 0,
  fibra_g NUMERIC(5, 2) DEFAULT 0,
  sodio_mg NUMERIC(6, 2) DEFAULT 0,
  codigo_barras TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal logs"
  ON public.meal_logs FOR ALL
  USING (auth.uid() = user_id);

-- 3. Daily Water Logs
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  ml_consumidos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, fecha)
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own water logs"
  ON public.water_logs FOR ALL
  USING (auth.uid() = user_id);

-- 4. Weight Tracking History & Adaptive Adjustments
CREATE TABLE IF NOT EXISTS public.weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  peso_kg NUMERIC(5, 2) NOT NULL,
  tdee_adaptado INTEGER,
  presupuesto_adaptado INTEGER,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight history"
  ON public.weight_history FOR ALL
  USING (auth.uid() = user_id);

-- 5. Fasting Sessions
CREATE TABLE IF NOT EXISTS public.fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  protocolo TEXT NOT NULL DEFAULT '16:8',
  inicio_ayuno TIMESTAMPTZ NOT NULL,
  fin_ayuno TIMESTAMPTZ,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own fasting sessions"
  ON public.fasting_sessions FOR ALL
  USING (auth.uid() = user_id);
