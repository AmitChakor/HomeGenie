-- What this does:
-- Creates helpers and attendance_logs tables for tracking maid/helper attendance.
-- Face embeddings are stored on-device only — only the event metadata syncs here.

-- 1. Helpers table
CREATE TABLE IF NOT EXISTS public.helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'maid',
  phone TEXT,
  face_embedding_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_helpers_user ON public.helpers(user_id);

ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own helpers"
  ON public.helpers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own helpers"
  ON public.helpers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own helpers"
  ON public.helpers FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own helpers"
  ON public.helpers FOR DELETE USING (auth.uid() = user_id);

-- 2. Attendance logs table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES public.helpers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_at TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'manual' CHECK (method IN ('face', 'fingerprint', 'manual')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attendance_helper ON public.attendance_logs(helper_id, check_in_at DESC);
CREATE INDEX idx_attendance_user ON public.attendance_logs(user_id, check_in_at DESC);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance logs"
  ON public.attendance_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance logs"
  ON public.attendance_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance logs"
  ON public.attendance_logs FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attendance logs"
  ON public.attendance_logs FOR DELETE USING (auth.uid() = user_id);
