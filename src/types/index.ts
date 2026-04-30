// src/types/index.ts

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'seller';
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'seller';
  phone?: string | null;
  gender?: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_default: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  level_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
  category?: Category;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  payment_status?: 'unpaid' | 'paid' | 'refunded';
  snap_token?: string | null;
  shipping_address?: string | null;
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: 'user' | 'seller';
  message: string | null;
  image_url: string | null;
  message_type: 'text' | 'image' | 'cancellation' | 'system';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Pick<Profile, 'full_name' | 'avatar_url'>;
}
