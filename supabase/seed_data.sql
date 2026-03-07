-- Mock Data for Nuxes E-Commerce
-- Replace 'YOUR_USER_ID' with the actual UUID from your auth.users table (you can find this in the Supabase Dashboard)

-- Categories: Electronics, Clothing, Accessories, Shoes, Home, Bags

INSERT INTO public.products (name, description, price, category, image_url, seller_id, stock)
VALUES
-- Electronics
('Wireless Noise Cancelling Headphones', 'Premium sound quality with active noise cancellation and 30-hour battery life.', 299.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'YOUR_USER_ID', 50),
('Smart Watch Series 7', 'Advanced health monitoring, larger display, and faster charging.', 399.00, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'YOUR_USER_ID', 35),
('Portable Bluetooth Speaker', 'Waterproof compact speaker with powerful bass and 360-degree sound.', 79.99, 'Electronics', 'https://images.unsplash.com/photo-1608156639585-b3a034ef9199?w=800&q=80', 'YOUR_USER_ID', 100),

-- Clothing
('Premium Cotton T-Shirt', 'Essential comfort made from 100% organic long-staple cotton.', 35.00, 'Clothing', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', 'YOUR_USER_ID', 200),
('Vintage Denim Jacket', 'Classic oversized fit denim jacket with distressed details.', 89.00, 'Clothing', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', 'YOUR_USER_ID', 45),
('Wool Blend Overcoat', 'Sophisticated winter coat with a modern tailored silhouette.', 189.50, 'Clothing', 'https://images.unsplash.com/photo-1539533330585-643c2c2f09d7?w=800&q=80', 'YOUR_USER_ID', 20),

-- Accessories
('Minimalist Leather Wallet', 'Slim bi-fold wallet made from premium Italian top-grain leather.', 45.00, 'Accessories', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', 'YOUR_USER_ID', 150),
('Polarized Wayfarer Sunglasses', 'Timeless design with full UV protection and durable frames.', 120.00, 'Accessories', 'https://images.unsplash.com/photo-1511499767010-856d5a420828?w=800&q=80', 'YOUR_USER_ID', 60),

-- Shoes
('CloudWalk Running Sneakers', 'Ultralight performance foam cushioning for all-day comfort.', 135.00, 'Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'YOUR_USER_ID', 80),
('Handcrafted Chelsea Boots', 'Suede leather finish with flexible gussets and stacked heel.', 165.00, 'Shoes', 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80', 'YOUR_USER_ID', 30),

-- Home
('Hand-poured Soy Candle', 'Relaxing lavender and driftwood scent. 40-hour burn time.', 24.00, 'Home', 'https://images.unsplash.com/photo-1602872030219-cbf917b0badb?w=800&q=80', 'YOUR_USER_ID', 120),
('Ceramic Geometric Vase', 'Modern artisan-crafted decorative piece for the contemporary home.', 55.00, 'Home', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80', 'YOUR_USER_ID', 40),

-- Bags
('Large Canvas Weekend Bag', 'Durable water-resistant canvas with leather accents.', 145.00, 'Bags', 'https://images.unsplash.com/photo-1544816153-12ad5d713312?w=800&q=80', 'YOUR_USER_ID', 25),
('Everyday Laptop Backpack', 'Clean aesthetic with padded 15" laptop sleeve and hidden pockets.', 95.00, 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'YOUR_USER_ID', 70);
