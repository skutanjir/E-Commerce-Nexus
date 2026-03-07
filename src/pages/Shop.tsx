import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ui/ProductCard';
import { useEffect } from 'react';
import type { Product } from '../types/database';
import { supabase } from '../lib/supabase';
import { categories } from '../data/categories';

const priceRanges = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200+', min: 200, max: Infinity },
];

const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Top Rated', value: 'rating' },
];

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category') || '';

    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [priceRange, setPriceRange] = useState(0);
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.from('products').select('*');
                if (error) throw error;
                // Add synthetic properties to match UI component
                const formatted = (data || []).map(p => ({
                    ...p
                }));
                setProducts(formatted as Product[]);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory) {
            result = result.filter((p) => p.category === selectedCategory);
        }

        const range = priceRanges[priceRange];
        result = result.filter((p) => p.price >= range.min && p.price < range.max);

        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }

        return result;
    }, [selectedCategory, priceRange, sortBy, products]);

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange(0);
        setSortBy('newest');
        setSearchParams({});
    };

    const hasActiveFilters = selectedCategory || priceRange > 0;

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <h1 className="text-4xl font-display font-bold text-surface-900">
                    {selectedCategory || 'All Products'}
                </h1>
                <p className="text-surface-500 mt-2">
                    {filteredProducts.length} products found
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile filter toggle */}
                    <div className="lg:hidden flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-medium hover:bg-surface-50 transition-colors cursor-pointer"
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                        </button>
                        <div className="relative flex-1">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-medium bg-white pr-10 cursor-pointer"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Sidebar Filters */}
                    <AnimatePresence>
                        {(showFilters || typeof window !== 'undefined') && (
                            <motion.aside
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
                            >
                                <div className="sticky top-28 space-y-6">
                                    {/* Categories */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                                        <h3 className="font-semibold text-surface-900 mb-4">Categories</h3>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => { setSelectedCategory(''); setSearchParams({}); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${!selectedCategory ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-50'
                                                    }`}
                                            >
                                                All Categories
                                            </button>
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.slug}
                                                    onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${selectedCategory === cat.slug ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-50'
                                                        }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                                        <h3 className="font-semibold text-surface-900 mb-4">Price Range</h3>
                                        <div className="space-y-1">
                                            {priceRanges.map((range, i) => (
                                                <button
                                                    key={range.label}
                                                    onClick={() => setPriceRange(i)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${priceRange === i ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-50'
                                                        }`}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium cursor-pointer"
                                        >
                                            <X size={16} />
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Desktop sort */}
                        <div className="hidden lg:flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <span className="text-sm text-surface-500">
                                        Showing {filteredProducts.length} results
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none px-4 py-2 border border-surface-200 rounded-xl text-sm font-medium bg-white pr-10 cursor-pointer"
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-20 text-surface-500">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-surface-400 text-lg">No products found</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary-600 font-medium hover:text-primary-700 cursor-pointer"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
