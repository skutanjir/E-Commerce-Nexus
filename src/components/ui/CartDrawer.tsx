import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import Button from './Button';

export default function CartDrawer() {
    const { state, dispatch, totalItems, totalPrice } = useCart();

    return (
        <AnimatePresence>
            {state.isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={() => dispatch({ type: 'CLOSE_CART' })}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-surface-100">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={22} />
                                <h2 className="text-lg font-bold">Shopping Cart</h2>
                                <span className="bg-surface-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            </div>
                            <button
                                onClick={() => dispatch({ type: 'CLOSE_CART' })}
                                className="w-10 h-10 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {state.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag size={64} className="text-surface-200 mb-4" />
                                    <p className="text-surface-500 text-lg font-medium">Your cart is empty</p>
                                    <p className="text-surface-400 text-sm mt-1">Add some items to get started!</p>
                                    <Button
                                        variant="primary"
                                        className="mt-6"
                                        onClick={() => dispatch({ type: 'CLOSE_CART' })}
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {state.items.map((item) => (
                                            <motion.div
                                                key={item.product.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="flex gap-4 p-3 rounded-xl bg-surface-50"
                                            >
                                                <img
                                                    src={item.product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                                                    <p className="text-primary-600 font-bold mt-1">${item.product.price.toFixed(2)}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() =>
                                                                dispatch({
                                                                    type: 'UPDATE_QUANTITY',
                                                                    payload: { productId: item.product.id, quantity: item.quantity - 1 },
                                                                })
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors cursor-pointer"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() =>
                                                                dispatch({
                                                                    type: 'UPDATE_QUANTITY',
                                                                    payload: { productId: item.product.id, quantity: item.quantity + 1 },
                                                                })
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors cursor-pointer"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.product.id })}
                                                    className="text-surface-400 hover:text-red-500 transition-colors self-start cursor-pointer"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {state.items.length > 0 && (
                            <div className="border-t border-surface-100 p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-surface-500">Subtotal</span>
                                    <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-surface-400">Shipping and taxes calculated at checkout</p>
                                <Link
                                    to="/checkout"
                                    onClick={() => dispatch({ type: 'CLOSE_CART' })}
                                    className="flex items-center justify-center gap-2 w-full bg-surface-900 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-600 transition-colors"
                                >
                                    Checkout <ArrowRight size={18} />
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={() => dispatch({ type: 'CLOSE_CART' })}
                                    className="flex items-center justify-center w-full text-surface-600 font-medium py-2 hover:text-surface-900 transition-colors"
                                >
                                    View Full Cart
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
