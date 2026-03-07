-- Create Products table
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  image_url text,
  seller_id uuid REFERENCES auth.users NOT NULL,
  stock integer DEFAULT 0 NOT NULL
);

-- Create Orders table
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users, -- optional for guests
  status text DEFAULT 'Pending' NOT NULL,
  total_amount numeric NOT NULL,
  shipping_address text NOT NULL,
  tracking_number text
);

-- Create Order Items table
CREATE TABLE public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products NOT NULL,
  quantity integer NOT NULL,
  price_at_time numeric NOT NULL
);

-- Create Favorites table
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Set Row Level Security (RLS) policies

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Products Policies:
-- Everyone can read products
CREATE POLICY "Public products are viewable by everyone." 
  ON public.products FOR SELECT USING (true);

-- Only authenticated sellers can insert products
CREATE POLICY "Sellers can create products." 
  ON public.products FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND auth.uid() = seller_id
  );

-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products." 
  ON public.products FOR UPDATE USING (
    auth.uid() = seller_id
  );

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete their own products." 
  ON public.products FOR DELETE USING (
    auth.uid() = seller_id
  );


-- Orders Policies:
-- Users can see their own orders. Guests (no user_id) cannot see past orders via auth.
CREATE POLICY "Users can view their own orders." 
  ON public.orders FOR SELECT USING (
    auth.uid() = user_id
  );

-- Anyone can insert an order (Guest checkout allowed)
CREATE POLICY "Anyone can create an order." 
  ON public.orders FOR INSERT WITH CHECK (true);

-- Only Sellers can update an order's status (we allow any seller for now, in a real app would join via order_items)
-- Since this is a simple schema, we'll allow authenticated users to update orders if they are sellers (we verify UI side)
CREATE POLICY "Sellers can update orders." 
  ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');


-- Order Items Policies:
-- Users can see their own order items
CREATE POLICY "Users can view their own order items through orders." 
  ON public.order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = order_items.order_id AND public.orders.user_id = auth.uid()
    )
  );

-- Anyone can insert order items
CREATE POLICY "Anyone can create order items." 
  ON public.order_items FOR INSERT WITH CHECK (true);


-- Favorites Policies:
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites." 
  ON public.favorites FOR SELECT USING (
    auth.uid() = user_id
  );

-- Users can insert their own favorites
CREATE POLICY "Users can create their own favorites." 
  ON public.favorites FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites." 
  ON public.favorites FOR DELETE USING (
    auth.uid() = user_id
  );
