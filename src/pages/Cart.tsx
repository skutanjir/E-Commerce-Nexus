import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';

export default function Cart() {
    const { state, dispatch, totalPrice } = useCart();

    const shipping = totalPrice > 100 ? 0 : 9.99;
    const tax = totalPrice * 0.1;
    const total = totalPrice + shipping + tax;

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag size={80} className="mx-auto text-surface-200 mb-6" />
                    <h1 className="text-3xl font-display font-bold text-surface-900 mb-3">Your Cart is Empty</h1>
                    <p className="text-surface-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-surface-900 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                    >
                        Start Shopping <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-display font-bold text-surface-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {state.items.map((item) => (
                                <motion.div
                                    key={item.product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="flex gap-5 p-5 bg-white rounded-2xl shadow-sm"
                                >
                                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                                        <img
                                            src={item.product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
                                            alt={item.product.name}
                                            className="w-28 h-28 object-cover rounded-xl"
                                        />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Link to={`/product/${item.product.id}`}>
                                                    <h3 className="font-semibold text-surface-900 hover:text-primary-600 transition-colors">
                                                        {item.product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-surface-400 mt-0.5">{item.product.category}</p>
                                            </div>
                                            <button
                                                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.product.id })}
                                                className="text-surface-400 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-surface-200 rounded-xl">
                                                <button
                                                    onClick={() =>
                                                        dispatch({
                                                            type: 'UPDATE_QUANTITY',
                                                            payload: { productId: item.product.id, quantity: item.quantity - 1 },
                                                        })
                                                    }
                                                    className="w-9 h-9 flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() =>
                                                        dispatch({
                                                            type: 'UPDATE_QUANTITY',
                                                            payload: { productId: item.product.id, quantity: item.quantity + 1 },
                                                        })
                                                    }
                                                    disabled={item.quantity >= item.product.stock}
                                                    className="w-9 h-9 flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="text-lg font-bold text-surface-900">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                            <h2 className="text-lg font-bold text-surface-900 mb-6">Order Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Subtotal</span>
                                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-emerald-500">Free</span>
                                        ) : (
                                            `$${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Tax (10%)</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-surface-100 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-base font-bold text-surface-900">Total</span>
                                        <span className="text-base font-bold text-surface-900">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {shipping > 0 && (
                                <p className="text-xs text-surface-400 mt-4 text-center">
                                    Add ${(100 - totalPrice).toFixed(2)} more for free shipping
                                </p>
                            )}

                            <Link to="/checkout" className="block mt-6">
                                <Button fullWidth size="lg">
                                    Proceed to Checkout <ArrowRight size={18} />
                                </Button>
                            </Link>

                            <Link
                                to="/shop"
                                className="block text-center text-sm text-surface-500 hover:text-surface-700 font-medium mt-4 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
