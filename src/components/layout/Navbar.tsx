import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, Heart, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/shop?category=Clothing', label: 'Clothing' },
    { to: '/shop?category=Electronics', label: 'Electronics' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { dispatch, totalItems } = useCart();
    const { user, signOut } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handler = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
    }, [location]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled
                    ? 'glass shadow-lg shadow-black/5 py-3'
                    : 'bg-white/60 backdrop-blur-md border-b border-white/20 py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-display font-bold tracking-tight gradient-text">
                                Nuxes
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.to}
                                    className={`text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === link.to
                                        ? 'text-primary-600'
                                        : 'text-surface-600'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="w-10 h-10 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <Search size={20} />
                            </button>
                            {user && (
                                <Link
                                    to={user.user_metadata?.role === 'seller' ? '/seller/dashboard' : '/dashboard'}
                                    className="hidden sm:flex px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            )}
                            {user ? (
                                <div className="hidden sm:flex items-center gap-4">
                                    {user.user_metadata?.role === 'seller' && (
                                        <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                            Seller
                                        </span>
                                    )}
                                    <span className="text-sm font-medium text-surface-700">
                                        {user.user_metadata?.first_name || user.email}
                                    </span>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="hidden sm:flex w-10 h-10 rounded-full hover:bg-surface-100 items-center justify-center transition-colors"
                                    title="Sign In"
                                >
                                    <User size={20} />
                                </Link>
                            )}
                            <Link
                                to={user?.user_metadata?.role === 'seller' ? '/seller/dashboard?tab=favorites' : '/dashboard?tab=favorites'}
                                className="hidden sm:flex w-10 h-10 rounded-full hover:bg-surface-100 items-center justify-center transition-colors cursor-pointer"
                                title="My Favorites"
                            >
                                <Heart size={20} />
                            </Link>
                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                                className="relative w-10 h-10 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <ShoppingBag size={20} />
                                {totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden w-10 h-10 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="max-w-2xl mx-auto px-4 py-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search for products..."
                                        autoFocus
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-100 border-0 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-40 p-6 lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="text-2xl font-display font-bold gradient-text">Nuxes</span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-10 h-10 rounded-full hover:bg-surface-100 flex items-center justify-center cursor-pointer"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {user && (
                                <div className="mb-8 p-4 bg-surface-50 rounded-2xl border border-surface-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                            {(user.user_metadata?.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-surface-900 truncate">
                                                {user.user_metadata?.first_name || user.email}
                                            </p>
                                            <p className="text-xs text-surface-500 capitalize">{user.user_metadata?.role || 'Buyer'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <nav className="space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        to={link.to}
                                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${location.pathname === link.to
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-surface-600 hover:bg-surface-50'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-8 pt-8 border-t border-surface-100 space-y-1">
                                {user ? (
                                    <>
                                        <Link
                                            to={user.user_metadata?.role === 'seller' ? '/seller/dashboard' : '/dashboard'}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 hover:bg-surface-50 font-medium transition-colors"
                                        >
                                            <Package size={20} />
                                            Dashboard
                                        </Link>
                                        <Link
                                            to={user.user_metadata?.role === 'seller' ? '/seller/dashboard?tab=favorites' : '/dashboard?tab=favorites'}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 bg-red-50 font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <Heart size={20} />
                                            My Favorites
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <X size={20} />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 hover:bg-surface-50 transition-colors"
                                    >
                                        <User size={20} />
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
