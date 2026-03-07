import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Minus, Plus, ChevronRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '../types/database';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import { useFavorites } from '../context/FavoritesContext';

export default function ProductDetail() {
    const { id } = useParams();
    const { dispatch } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { isFavorite, toggleFavorite } = useFavorites();
    const isOutOfStock = product?.stock !== undefined && product.stock <= 0;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
                if (error) throw error;

                const formatted = {
                    ...data,
                };

                setProduct(formatted as Product);

                // Fetch related
                if (data?.category) {
                    const { data: related } = await supabase.from('products').select('*').eq('category', data.category).neq('id', id).limit(4);

                    setRelatedProducts((related || []).map(p => ({
                        ...p,
                    })) as Product[]);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">Loading product...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-surface-900 mb-2">Product Not Found</h1>
                    <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                product,
                quantity,
                color: product?.colors ? product.colors[selectedColor] : undefined,
                size: product?.sizes ? product.sizes[selectedSize] : undefined,
            },
        });
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <nav className="flex items-center gap-2 text-sm text-surface-400">
                    <Link to="/" className="hover:text-surface-600">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/shop" className="hover:text-surface-600">Shop</Link>
                    <ChevronRight size={14} />
                    <Link to={`/shop?category=${product.category}`} className="hover:text-surface-600">{product.category}</Link>
                    <ChevronRight size={14} />
                    <span className="text-surface-900 font-medium">{product.name}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden bg-surface-100 mb-4">
                            <img
                                src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {isOutOfStock && <Badge type="Out of Stock" className="bg-surface-900 text-white" />}
                            {product.badge && <Badge type={product.badge} />}
                            <span className="text-sm text-surface-400 uppercase tracking-wider">{product.category}</span>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-surface-900 mb-4">
                            {product.name}
                        </h1>

                        {product.rating !== undefined && product.rating > 0 && (
                            <div className="flex items-center gap-3 mb-6">
                                <StarRating rating={product.rating} size={18} />
                                <span className="text-sm text-surface-500">
                                    {product.rating} ({product.reviews || 0} reviews)
                                </span>
                            </div>
                        )}

                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-surface-900">${product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-xl text-surface-400 line-through">${product.originalPrice.toFixed(2)}</span>
                                    <span className="text-sm font-semibold text-red-500">
                                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                    </span>
                                </>
                            )}
                        </div>

                        <p className="text-surface-600 leading-relaxed mb-8">{product.description}</p>

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-surface-900 mb-3">Color</h3>
                                <div className="flex gap-2">
                                    {product.colors.map((color, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedColor(i)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${selectedColor === i ? 'border-primary-500 scale-110' : 'border-surface-200'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-surface-900 mb-3">Size</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size, i) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(i)}
                                            className={`w-12 h-12 rounded-xl font-medium text-sm transition-all cursor-pointer ${selectedSize === i
                                                ? 'bg-surface-900 text-white'
                                                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center border border-surface-200 rounded-xl">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={isOutOfStock}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-12 text-center font-semibold">{isOutOfStock ? 0 : quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={isOutOfStock || quantity >= product.stock}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                size="lg"
                                className="flex-1"
                                disabled={isOutOfStock}
                            >
                                <ShoppingBag size={20} />
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                            <button
                                onClick={() => toggleFavorite(product)}
                                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${isFavorite(product.id)
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'border-surface-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                                    }`}
                            >
                                <Heart size={20} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                            </button>
                        </div>
                        {product.stock > 0 && product.stock <= 5 && (
                            <p className="text-sm text-red-500 font-medium mb-6">
                                Only {product.stock} items left in stock!
                            </p>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-surface-100">
                            {[
                                { icon: Truck, label: 'Free Shipping' },
                                { icon: ShieldCheck, label: 'Secure Payment' },
                                { icon: RefreshCcw, label: '30-Day Returns' },
                            ].map((f) => (
                                <div key={f.label} className="text-center">
                                    <f.icon className="mx-auto mb-1 text-surface-400" size={20} />
                                    <span className="text-xs text-surface-500">{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-2xl font-display font-bold text-surface-900 mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
