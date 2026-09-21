-- What this does:
-- Creates grocery_lists and grocery_items tables with RLS.
-- Lists belong to a user and optionally reference a store vendor.
-- Items belong to a list. Both are scoped by user ownership.

-- 1. Grocery lists
CREATE TABLE IF NOT EXISTS public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  store_vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grocery_lists_user ON public.grocery_lists(user_id, created_at DESC);

ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grocery lists"
  ON public.grocery_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery lists"
  ON public.grocery_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery lists"
  ON public.grocery_lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery lists"
  ON public.grocery_lists FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Grocery items
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT,
  notes TEXT,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grocery_items_list ON public.grocery_items(list_id, created_at ASC);

ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- Items inherit access from their parent list's user_id
CREATE POLICY "Users can view own grocery items"
  ON public.grocery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
        AND grocery_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own grocery items"
  ON public.grocery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
        AND grocery_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own grocery items"
  ON public.grocery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
        AND grocery_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own grocery items"
  ON public.grocery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
        AND grocery_lists.user_id = auth.uid()
    )
  );
