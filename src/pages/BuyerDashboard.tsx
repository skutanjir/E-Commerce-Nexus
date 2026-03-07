import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, Truck, Clock, CheckCircle, Heart, Store } from 'lucide-react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import type { Order, Product } from '../types/database';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ui/ProductCard';

export default function BuyerDashboard() {
    const { user, isBuyer, loading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [favsLoading, setFavsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'orders' | 'favorites'>((searchParams.get('tab') as any) || 'orders');
    const { favorites } = useFavorites();

    useEffect(() => {
        if (user && isBuyer) {
            fetchOrders();
            fetchFavoriteProducts();
        }
    }, [user, isBuyer, favorites]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchFavoriteProducts = async () => {
        if (favorites.length === 0) {
            setFavoriteProducts([]);
            setFavsLoading(false);
            return;
        }

        try {
            setFavsLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .in('id', favorites);

            if (error) throw error;
            setFavoriteProducts(data || []);
        } catch (err) {
            console.error('Error fetching favorites products:', err);
        } finally {
            setFavsLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || !isBuyer) return <Navigate to="/login" replace />;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock size={20} className="text-yellow-500" />;
            case 'Paid': return <Package size={20} className="text-blue-500" />;
            case 'Shipped': return <Truck size={20} className="text-primary-500" />;
            case 'Delivered': return <CheckCircle size={20} className="text-green-500" />;
            default: return <Package size={20} className="text-surface-400" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-surface-900">My Dashboard</h1>
                <p className="text-surface-500 mt-2">Welcome back, {user.user_metadata?.first_name || 'Buyer'}!</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-surface-100 p-1 rounded-xl mb-8 w-fit">
                <button
                    onClick={() => {
                        setActiveTab('orders');
                        setSearchParams({ tab: 'orders' });
                    }}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                        }`}
                >
                    Order History
                </button>
                <button
                    onClick={() => {
                        setActiveTab('favorites');
                        setSearchParams({ tab: 'favorites' });
                    }}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'favorites' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                        }`}
                >
                    My Favorites
                </button>
            </div>

            {activeTab === 'orders' ? (

                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                    <div className="p-6 border-b border-surface-200">
                        <h2 className="text-xl font-bold text-surface-900">Order History & Tracking</h2>
                    </div>

                    <div className="p-6">
                        {ordersLoading ? (
                            <div className="text-center py-8 text-surface-500">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package size={48} className="mx-auto text-surface-300 mb-4" />
                                <h3 className="text-lg font-medium text-surface-900">No orders yet</h3>
                                <p className="text-surface-500 mt-1">When you buy something, it will track here.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-surface-200 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between hover:border-primary-200 transition-all bg-white shadow-sm">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">#{order.id.slice(0, 8)}</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                    order.status === 'Shipped' ? 'bg-primary-50 text-primary-600' : 'bg-yellow-50 text-yellow-600'
                                                    }`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="font-bold text-2xl text-surface-900">${order.total_amount.toFixed(2)}</p>
                                                <p className="text-xs text-surface-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="bg-surface-50 p-4 rounded-xl border border-surface-100 flex-shrink-0 lg:min-w-[300px]">
                                            <h4 className="text-xs font-bold text-surface-900 mb-3 flex items-center gap-2 uppercase tracking-tight">
                                                <Truck size={14} className="text-primary-500" /> Package Tracker
                                            </h4>
                                            {order.tracking_number ? (
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[10px] font-bold text-surface-400 uppercase">Tracking Number</p>
                                                    <p className="font-mono text-sm font-semibold text-primary-600">{order.tracking_number}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-surface-500 italic">Status updates will appear here once shipped.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-surface-900">Loved Items</h2>
                        <span className="text-sm text-surface-500">{favoriteProducts.length} items saved</span>
                    </div>

                    {favsLoading ? (
                        <div className="text-center py-20 text-surface-500 text-lg">Loading your favorites...</div>
                    ) : favoriteProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart size={40} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-surface-900 mb-2">No favorites yet</h3>
                            <p className="text-surface-500 mb-8 max-w-xs mx-auto">Items you heart while shopping will appear here for quick access.</p>
                            <Link to="/shop">
                                <button className="px-8 py-3 bg-surface-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-all flex items-center gap-2 mx-auto cursor-pointer">
                                    <Store size={18} />
                                    Explore Products
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {favoriteProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
