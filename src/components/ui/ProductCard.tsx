import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '../../types/database';
import Badge from './Badge';
import StarRating from './StarRating';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { dispatch } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isOutOfStock = product.stock <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
        >
            {/* Image */}
            <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
                <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                {/* Badge */}
                {product.badge && (
                    <div className="absolute top-3 left-3">
                        <Badge type={product.badge} />
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute top-3 left-3">
                        <Badge type="Out of Stock" className="bg-surface-900 text-white" />
                    </div>
                )}
                {/* Quick actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(product);
                        }}
                        className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-md cursor-pointer ${isFavorite(product.id)
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-white/90 text-surface-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                    >
                        <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                    </button>
                </div>
            </Link>

            {/* Info */}
            <div className="p-4">
                <Link to={`/product/${product.id}`} className="block">
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">
                        {product.category}
                    </p>
                    <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                {product.rating !== undefined && product.rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        <StarRating rating={product.rating} size={14} />
                        <span className="text-xs text-surface-400">({product.reviews || 0})</span>
                    </div>
                )}

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-surface-900">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-surface-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => !isOutOfStock && dispatch({ type: 'ADD_ITEM', payload: { product } })}
                        disabled={isOutOfStock}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${isOutOfStock
                            ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                            : 'bg-surface-900 text-white hover:bg-primary-600'
                            }`}
                    >
                        <ShoppingBag size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
