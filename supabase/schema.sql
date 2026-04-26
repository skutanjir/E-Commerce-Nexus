-- Database Schema for NEXUS E-Commerce
-- Safe to re-run: semua policy di-drop dulu sebelum dibuat ulang

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Sellers can view all profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
DROP POLICY IF EXISTS "Sellers can manage categories." ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Categories are viewable by everyone." ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage categories." ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'seller'
    )
  );

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  level_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Sellers can manage products." ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Products are viewable by everyone." ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage products." ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'seller'
    )
  );

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'completed', 'cancelled')),
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_address TEXT,
  snap_token TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'pending', 'failed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders." ON public.orders;
DROP POLICY IF EXISTS "Sellers can view all orders." ON public.orders;
DROP POLICY IF EXISTS "Sellers can update order status." ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

CREATE POLICY "Users can view their own orders." ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders." ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can view all orders." ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'seller'
    )
  );

CREATE POLICY "Sellers can update order status." ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'seller'
    )
  );

-- ============================================
-- 5. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items." ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view all order items." ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

CREATE POLICY "Users can view their own order items." ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items." ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can view all order items." ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'seller'
    )
  );

-- ============================================
-- 6. PROMOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.promos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 90),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can manage own promos." ON public.promos;
DROP POLICY IF EXISTS "Anyone can view active promos." ON public.promos;
DROP POLICY IF EXISTS "Sellers manage own promos" ON public.promos;

CREATE POLICY "Sellers can manage own promos." ON public.promos
  FOR ALL USING (seller_id = auth.uid());

CREATE POLICY "Anyone can view active promos." ON public.promos
  FOR SELECT USING (CURRENT_DATE BETWEEN start_date AND end_date);

-- ============================================
-- 7. TRIGGER: auto-insert profile on signup
--    (mendukung Google OAuth: pakai 'name' & 'picture')
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.email, new.raw_user_meta_data->>'email', ''),
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      NULL
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 8. MIGRATE: update role 'admin' → 'seller'
-- ============================================
UPDATE public.profiles SET role = 'seller' WHERE role = 'admin';

-- ============================================
-- 9. MIDTRANS: tambah kolom ke orders
--    (aman dijalankan berkali-kali)
-- ============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS snap_token TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- ============================================
-- 10. SAMPLE DATA (Categories)
-- ============================================
INSERT INTO public.categories (name, slug, icon, image_url, description) VALUES
('Electronics', 'electronics', 'devices', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRgVlnFm8-NHptPfg1SuhyEzKmUCqSpEq-74PGQOBulfzx4Z26MKnivIieQRQ-MVzn1njd1xZikMoUyjmTfdiNdNuemd3LZe_eeir1GLNIxNURBOD4KpU82EUyYj-_ALETvG2a3gYCtro-xfvSBZ_VgQGtaOr8jEc3ylZR5GlktqlTQISaX0x_4gNGvH9_STIeK0gBeDfowXHVN7KZ1B62FUfFYgnPdNbFwDZn9QUjN1569cZjSOumzQ924_l8JOVptAl0gU5HnQ', 'Gadget dan perangkat elektronik terkini.'),
('Fashion', 'fashion', 'apparel', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4vIWQ5p7ZNnc2CUvVqjlhcraDKmb-IP_rlAg8PccCroczQyXXZd925nmKr3LFPc3N_dshgq1oZgM82wUGSgxnFRPAI8W6tPH9nnETkH_OK31RphLDtxqCOD_isOc7SOAX3Iw0ykcXviBCVn1Uw4mEAx7b6GCmk2CNTaJbtbY1f3caI3zP4eoxyKSuqAMYJf_okAskVhNqs_bGT2XZoi-F_bJPDoQFTLxJ4IShRg2r5pDIaSqCCnB4hzkzKcRD_fMLuEZazzk-RA8', 'Tren terkini pakaian dan aksesori.'),
('Furniture', 'furniture', 'chair', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL6M2hHcxwLfvEWOJA43aqQYUoj3O1G1jerQHe9LZ-nWxrh9CtlmYPyyisA5mftLx4jJAcVrVYtxR58JDAIJl2dfJBufCe-NIfRqhvqGrufoGLJMoIu2LEVGZmkMXdf8e5zJjyuKRoxX_ZC5g1REH76fVmmkyBcPsiZSi-mI93pX77QADumVJcS9rznCpZEvlDJFyvTZHpz21RYCbJl3gio9ng1Y4E8L17RURY59RSQ1Kc2qXum65iLebiVFllcG7lNNELWj3pHyE', 'Furnitur elegan untuk rumah Anda.'),
('Beauty', 'beauty', 'face_retouching_natural', 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2y7AaZUOIigE3lWmHLytNfRcrnmSwdVG2jnGdAoilSvsdMXuKn7GBZV6K_9Ur69-C5r5GgcL44YwZvb9j7rDt4lg60WAGI8k1IrzoHsKejBkGQwhN74RpBx4is-ELYpSMFXIMh4ebpZ4og5hrEY5UnG9YzICB1QMt7_K9KhXlMEFcUUsSuHHg9FMoF18z0wBOH9G-ReA3uELyaGMtIsj7vjXs3z_CZhYrCXBzXjoPk2v5obAnpbP4O3ifNrZKvY5efAecmqMySXE', 'Produk perawatan kulit dan kecantikan.'),
('Sports', 'sports', 'fitness_center', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9yGKjgxzIZxteAPY5vn2Qfp6vaF-6SgP7ncMwPDrlyuRgA873ltKGtNSmug4Q1vetudJDP9go3BL_FgnUIOFpSl195JAhcswbwZ2lP3Ak9I_tG74sORvRAUDIVkO9y-S2zADizxT-nU9PaGXTXxBIdXj0MsMF97FgUEkqPZRr6AGA1Al0T6CxjTWWhKL1rY6FhEnY32d_g_m5wunHxFl0tQJzf7Bf1COLaPBQtLw_TE_yjMRLXGmS4QVuhqS-X9wutHfroDDin6k', 'Peralatan dan perlengkapan olahraga.')
ON CONFLICT (slug) DO NOTHING;
