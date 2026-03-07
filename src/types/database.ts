export interface Product {
    id: string;
    created_at: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    seller_id: string;
    stock: number;
    sizes?: string[];
    colors?: string[];
    // Synthetic properties for UI compatibility
    reviews?: number;
    rating?: number;
    badge?: 'new' | 'sale' | 'trending';
    originalPrice?: number;
}

export interface Order {
    id: string;
    created_at: string;
    user_id: string | null;
    status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
    total_amount: number;
    shipping_address: string;
    tracking_number: string | null;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    product?: Product; // joined
}

export interface Favorite {
    id: string;
    created_at: string;
    user_id: string;
    product_id: string;
    product?: Product; // joined
}
