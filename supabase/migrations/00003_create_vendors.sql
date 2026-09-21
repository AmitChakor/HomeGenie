-- What this does:
-- Creates the vendors table with a category enum, RLS policies,
-- a vendor-avatars storage bucket, and adds vendor_id to messages
-- for tracking which conversations relate to which vendor.

-- 1. Create vendor category enum
CREATE TYPE public.vendor_category AS ENUM (
  'medical', 'maid', 'grocery', 'electrician', 'plumber', 'driver', 'other'
);

-- 2. Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category public.vendor_category NOT NULL DEFAULT 'other',
  phone TEXT NOT NULL,
  whatsapp TEXT,
  address TEXT,
  notes TEXT,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_vendors_category ON public.vendors(user_id, category);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 4. RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vendors"
  ON public.vendors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendors"
  ON public.vendors FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendors"
  ON public.vendors FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Add vendor_id to messages for interaction history
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;

CREATE INDEX idx_messages_vendor_id ON public.messages(vendor_id) WHERE vendor_id IS NOT NULL;

-- 6. Storage bucket for vendor avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-avatars', 'vendor-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload vendor avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own vendor avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vendor-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own vendor avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vendor-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Vendor avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-avatars');
