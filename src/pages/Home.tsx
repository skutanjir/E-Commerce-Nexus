import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Headphones, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ui/ProductCard';
import { useState, useEffect } from 'react';
import type { Product } from '../types/database';
import { supabase } from '../lib/supabase';
import { categories } from '../data/categories';

const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: '256-bit SSL encryption' },
    { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer care' },
];

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products
                const { data: productsData, error: productsError } = await supabase.from('products').select('*').limit(12);
                if (productsError) throw productsError;

                // Add synthetic properties to match UI component
                const formatted = (productsData || []).map(p => ({
                    ...p,
                    badge: Math.random() > 0.8 ? 'new' : (Math.random() > 0.9 ? 'trending' : undefined)
                }));
                setProducts(formatted as Product[]);

                // Fetch category counts
                const { data: countData, error: countError } = await supabase
                    .from('products')
                    .select('category');

                if (countError) throw countError;

                const counts = (countData || []).reduce((acc: Record<string, number>, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                }, {});
                setCategoryCounts(counts);

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fix: Ensure we show 8 products even if badges are missing
    const featuredProducts = products.filter((p) => p.badge === 'trending' || p.badge === 'new').length >= 4
        ? products.filter((p) => p.badge === 'trending' || p.badge === 'new').slice(0, 8)
        : products.slice(0, 8);

    const saleProducts = products.filter((p) => p.badge === 'sale').slice(0, 4);

    return (
        <div>
            {/* Hero */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface-950/90 via-surface-950/60 to-transparent" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-2xl"
                    >
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium border border-white/10 mb-6"
                        >
                            ✨ New Collection 2026
                        </motion.span>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
                            Discover Your
                            <br />
                            <span className="gradient-text">Perfect Style</span>
                        </h1>
                        <p className="text-lg text-surface-300 max-w-lg mb-8 leading-relaxed">
                            Explore our curated collection of premium products designed for the modern lifestyle. Quality meets elegance.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-surface-900 font-semibold rounded-xl hover:bg-surface-100 transition-all shadow-xl shadow-black/20 group"
                            >
                                Shop Now
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/shop?category=Clothing"
                                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all"
                            >
                                View Collections
                            </Link>
                        </div>
                    </motion.div>
                </div>
                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
                        <div className="w-1.5 h-3 rounded-full bg-white/60" />
                    </div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="relative -mt-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                            >
                                <feature.icon className="mx-auto mb-3 text-primary-500" size={28} />
                                <h3 className="font-semibold text-surface-900 text-sm">{feature.title}</h3>
                                <p className="text-xs text-surface-500 mt-1">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-surface-900">Shop by Category</h2>
                        <p className="text-surface-500 mt-2">Find what you're looking for</p>
                    </div>
                    <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                to={`/shop?category=${cat.slug}`}
                                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden"
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                                    <p className="text-white/70 text-sm">
                                        {categoryCounts[cat.slug] || 0} products
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-surface-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Featured Products</h2>
                            <p className="text-surface-500 mt-2">Hand-picked for you</p>
                        </div>
                        <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                            See All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading ? (
                            <div className="col-span-full text-center py-10 text-surface-500">Loading featured products...</div>
                        ) : (
                            featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        )}
                    </div>
                </div>
            </section>


            {/* Sale Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-surface-900">On Sale</h2>
                        <p className="text-surface-500 mt-2">Grab these deals before they're gone</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        <div className="col-span-full text-center py-10 text-surface-500">Loading sale products...</div>
                    ) : (
                        saleProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-surface-900 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-white">What Our Customers Say</h2>
                        <p className="text-surface-400 mt-2">Trusted by thousands worldwide</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Sarah K.', text: 'Absolutely love the quality! The leather backpack exceeded my expectations. Highly recommend Nuxes.', avatar: '👩‍💼' },
                            { name: 'James L.', text: 'Fast shipping and amazing customer service. My go-to store for premium essentials.', avatar: '👨‍💻' },
                            { name: 'Emma W.', text: 'The attention to detail is incredible. Every product feels like a luxury experience.', avatar: '👩‍🎨' },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="bg-surface-800 rounded-2xl p-6 border border-surface-700"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{t.avatar}</span>
                                    <div>
                                        <p className="font-semibold text-white">{t.name}</p>
                                        <p className="text-xs text-surface-400">Verified Buyer</p>
                                    </div>
                                </div>
                                <p className="text-surface-300 text-sm leading-relaxed">"{t.text}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
