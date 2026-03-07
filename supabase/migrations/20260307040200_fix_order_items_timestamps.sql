-- Add created_at column to order_items for sorting and tracking
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
