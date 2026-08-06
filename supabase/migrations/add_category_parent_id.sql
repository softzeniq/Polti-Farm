-- Add parent_id to categories to support sub-categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Optionally, create an index to improve query performance for finding children
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);
