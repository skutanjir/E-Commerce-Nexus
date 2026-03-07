import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Package, LayoutDashboard, List, ShoppingCart, DollarSign, X, Upload, Link2, Heart } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';
import type { Product, OrderItem } from '../types/database';
import { categories } from '../data/categories';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ui/ProductCard';

// Color Conversion Utilities
const hexToHsv = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number) => {
    s /= 100;
    v /= 100;
    let i = Math.floor(h / 60);
    let f = h / 60 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

function IntegratedColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
    const [hsv, setHsv] = useState(hexToHsv(color));
    const [isDraggingField, setIsDraggingField] = useState(false);
    const [isDraggingHue, setIsDraggingHue] = useState(false);
    const fieldRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    // Update HSV when external color changes (presets)
    useEffect(() => {
        const newHsv = hexToHsv(color);
        // Compare hex values to avoid infinite loops due to float precision
        if (hsvToHex(newHsv.h, newHsv.s, newHsv.v) !== color) {
            setHsv(newHsv);
        }
    }, [color]);

    const updateFromField = useCallback((e: any) => {
        if (!fieldRef.current) return;
        const rect = fieldRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
        const newHsv = { ...hsv, s: x * 100, v: y * 100 };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    }, [hsv, onChange]);

    const updateFromHue = useCallback((e: any) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newHsv = { ...hsv, h: x * 360 };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    }, [hsv, onChange]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingField) updateFromField(e);
            if (isDraggingHue) updateFromHue(e);
        };
        const handleMouseUp = () => {
            setIsDraggingField(false);
            setIsDraggingHue(false);
        };

        if (isDraggingField || isDraggingHue) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingField, isDraggingHue, updateFromField, updateFromHue]);

    return (
        <div className="p-3 bg-white rounded-2xl border border-surface-200 shadow-sm space-y-4">
            <div
                ref={fieldRef}
                className="relative aspect-square w-full rounded-xl overflow-hidden cursor-crosshair touch-none shadow-inner"
                style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                onMouseDown={(e) => {
                    setIsDraggingField(true);
                    updateFromField(e);
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 ring-1 ring-black/10 pointer-events-none"
                    style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
                />
            </div>

            <div className="flex flex-col gap-3">
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-widest px-1">Hue Spectrum</p>
                <div
                    ref={hueRef}
                    className="relative h-4 w-full rounded-full cursor-pointer touch-none shadow-inner"
                    style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                    onMouseDown={(e) => {
                        setIsDraggingHue(true);
                        updateFromHue(e);
                    }}
                >
                    <div
                        className="absolute w-5 h-5 bg-white border-2 border-surface-900 rounded-full shadow-md top-1/2 -translate-y-1/2 -translate-x-1/2 ring-2 ring-white pointer-events-none transition-transform hover:scale-110"
                        style={{ left: `${(hsv.h / 360) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function SellerDashboard() {
    const { user, isSeller, loading } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favsLoading, setFavsLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'favorites'>((searchParams.get('tab') as any) || 'overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { favorites } = useFavorites();

    useEffect(() => {
        if (user && isSeller) {
            fetchDashboardData();
            fetchFavoriteProducts();
        }
    }, [user, isSeller, favorites]);

    const fetchDashboardData = async () => {
        try {
            // Fetch seller's products
            const { data: myProducts, error: prodError } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user?.id)
                .order('created_at', { ascending: false });

            if (prodError) throw prodError;
            setProducts(myProducts || []);

            // Fetch order items for seller's products - Optimized query
            const { data: sellerItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*, order:orders(*), product:products!inner(*)')
                .eq('product.seller_id', user?.id)
                .order('created_at', { ascending: false });

            if (!itemsError) {
                setRecentOrders(sellerItems || []);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setIsLoading(false);
        }
    };

    const fetchFavoriteProducts = async () => {
        if (!favorites.length) {
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
            console.error('Error fetching favorites:', err);
        } finally {
            setFavsLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchDashboardData();
            alert('Product deleted successfully.');
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Failed to delete product.');
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || !isSeller) return <Navigate to="/login" replace />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            {/* Modal for Adding/Editing Product */}
            {isModalOpen && (
                <ProductModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                        fetchDashboardData();
                    }}
                    sellerId={user.id}
                    initialData={editingProduct}
                />
            )}

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-surface-900 uppercase tracking-tight">Seller <span className="text-primary-600">Central</span></h1>
                    <p className="text-surface-500 mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Store: {user.user_metadata?.store_name || 'My Store'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    Add New Product
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-1 scrollbar-hide">
                <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-2xl w-fit min-w-full sm:min-w-0">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'products', label: 'My Products', icon: List },
                        { id: 'orders', label: 'Store Orders', icon: ShoppingCart },
                        { id: 'favorites', label: 'My Favorites', icon: Heart },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSearchParams({ tab: tab.id });
                            }}
                            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-500 hover:text-surface-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-500">Total Revenue</p>
                                        <h3 className="text-2xl font-bold text-surface-900">
                                            ${recentOrders
                                                .filter(item => (item as any).order?.status !== 'Cancelled')
                                                .reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0)
                                                .toFixed(2)}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <ShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-500">Active Orders</p>
                                        <h3 className="text-2xl font-bold text-surface-900">
                                            {recentOrders.filter(o => !['Delivered', 'Cancelled'].includes((o as any).order?.status)).length}
                                        </h3>
                                    </div>
                                </div>
                                <div className="text-xs text-surface-500 font-medium">
                                    Tracking {recentOrders.filter(o => (o as any).order?.status === 'Pending').length} pending shipments
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-500">Inventory Items</p>
                                        <h3 className="text-2xl font-bold text-surface-900">{products.length}</h3>
                                    </div>
                                </div>
                                <div className="text-xs text-surface-500 font-medium">
                                    {products.filter(p => p.stock < 10).length} items are low in stock
                                </div>
                            </div>
                        </div>

                        {/* Package Tracker Visual */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                                    <Package className="text-primary-600" size={20} />
                                    Package Tracker
                                </h3>
                                <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
                                    Manage Shipments
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Processing', status: 'Processing', color: 'blue' },
                                    { label: 'To Ship', status: 'Shipped', color: 'purple' },
                                    { label: 'In Transit', status: 'Out for Delivery', color: 'orange' },
                                    { label: 'Delivered', status: 'Delivered', color: 'green' },
                                ].map((stage) => {
                                    const count = recentOrders.filter(o => (o as any).order?.status === stage.status).length;
                                    return (
                                        <div key={stage.label} className={`p-4 rounded-xl border border-${stage.color}-100 bg-${stage.color}-50/30`}>
                                            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">{stage.label}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-2xl font-bold text-${stage.color}-600`}>{count}</span>
                                                <span className="text-[10px] text-surface-400 font-medium">PKGS</span>
                                            </div>
                                            <div className="mt-2 h-1 w-full bg-surface-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-${stage.color}-500 transition-all duration-500`}
                                                    style={{ width: `${recentOrders.length > 0 ? (count / recentOrders.length) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {(activeTab === 'products' || activeTab === 'overview') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                        <div className="p-6 border-b border-surface-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-surface-900">Products Inventory</h2>
                            {activeTab === 'overview' && (
                                <button onClick={() => setActiveTab('products')} className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
                            )}
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-center py-8 text-surface-500">Loading products...</div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-surface-200 rounded-xl">
                                    <Package size={48} className="mx-auto text-surface-300 mb-4" />
                                    <h3 className="text-lg font-medium text-surface-900">No products yet</h3>
                                    <p className="text-surface-500 mt-1 mb-6">Start selling by adding your first product.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.slice(0, activeTab === 'overview' ? 3 : undefined).map((product) => (
                                        <div key={product.id} className="flex flex-col xs:flex-row items-start xs:items-center gap-4 p-4 border border-surface-100 rounded-xl hover:bg-surface-50 transition-colors">
                                            <div className="w-full xs:w-16 h-32 xs:h-16 bg-surface-200 rounded-lg overflow-hidden flex-shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-8 h-8 m-4 text-surface-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 w-full">
                                                <h4 className="font-semibold text-surface-900 truncate">{product.name}</h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                    <span className="text-primary-600 font-medium">${product.price.toFixed(2)}</span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                        Stock: {product.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end xs:self-center">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(product);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(activeTab === 'orders' || activeTab === 'overview') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                        <div className="p-6 border-b border-surface-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-surface-900">Recent Customer Orders</h2>
                            {activeTab === 'overview' && (
                                <button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
                            )}
                        </div>
                        <div className="p-0 sm:p-6">
                            {isLoading ? (
                                <div className="text-center py-4 text-surface-500 text-sm">Loading...</div>
                            ) : recentOrders.length === 0 ? (
                                <div className="text-center py-8 text-surface-500 text-sm">
                                    <Package size={40} className="mx-auto text-surface-200 mb-3" />
                                    <p className="mb-2">No orders yet.</p>
                                    <p>Items users purchase from your store will appear here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto px-4 sm:px-0">
                                    <table className="w-full text-left min-w-[500px]">
                                        <thead>
                                            <tr className="text-sm font-medium text-surface-500 border-b border-surface-100">
                                                <th className="pb-4 pr-4">Product</th>
                                                <th className="pb-4 pr-4">Quantity</th>
                                                <th className="pb-4 pr-4">Amount</th>
                                                <th className="pb-4 pr-4">Status</th>
                                                <th className="pb-4">Order ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-100">
                                            {recentOrders.slice(0, activeTab === 'overview' ? 3 : undefined).map((item: any) => (
                                                <tr key={item.id} className="text-sm">
                                                    <td className="py-4 pr-4 font-medium text-surface-900 truncate max-w-[200px]">{item.product?.name}</td>
                                                    <td className="py-4 pr-4 text-surface-600">x{item.quantity}</td>
                                                    <td className="py-4 pr-4 font-bold text-surface-900">${(item.price_at_time * item.quantity).toFixed(2)}</td>
                                                    <td className="py-4 pr-4">
                                                        <select
                                                            value={item.order?.status || 'Pending'}
                                                            onChange={(e) => handleUpdateStatus(item.order_id, e.target.value)}
                                                            className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors ${item.order?.status === 'Paid' || item.order?.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                                                item.order?.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                                                                    item.order?.status === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                                                                        item.order?.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                                            'bg-surface-100 text-surface-600'
                                                                }`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Paid">Paid</option>
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 font-mono text-surface-400">{item.order_id.slice(0, 8)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'favorites' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                        <div className="p-6 border-b border-surface-200">
                            <h2 className="text-xl font-bold text-surface-900">My Favorites</h2>
                            <p className="text-sm text-surface-500 mt-1">Products you've saved for later</p>
                        </div>
                        <div className="p-6">
                            {favsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="aspect-[3/4] bg-surface-100 animate-pulse rounded-2xl" />
                                    ))}
                                </div>
                            ) : favoriteProducts.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                                        <Heart size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-surface-900">No favorites yet</h3>
                                    <p className="text-surface-500 mt-2 max-w-sm mx-auto">
                                        Explore our collection and tap the heart icon to save products here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favoriteProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductModal({ onClose, onSuccess, sellerId, initialData }: { onClose: () => void, onSuccess: () => void, sellerId: string, initialData?: Product | null }) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price.toString() || '');
    const [category, setCategory] = useState(initialData?.category || 'Electronics');
    const [stock, setStock] = useState(initialData?.stock.toString() || '10');
    const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
    const [colors, setColors] = useState<string[]>(initialData?.colors || []);
    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState('#6366f1');
    const PRESET_COLORS = [
        { label: 'Obsidian', value: '#000000' },
        { label: 'Pearl', value: '#FFFFFF' },
        { label: 'Cobalt', value: '#3B82F6' },
        { label: 'Emerald', value: '#10B981' },
        { label: 'Ruby', value: '#EF4444' },
        { label: 'Amber', value: '#F59E0B' },
        { label: 'Indigo', value: '#6366F1' },
        { label: 'Slate', value: '#64748B' },
    ];
    const [imageUrl, setImageUrl] = useState(initialData?.image_url && !initialData.image_url.includes('supabase.co/storage') ? initialData.image_url : '');
    const [imageMethod, setImageMethod] = useState<'url' | 'upload'>(
        initialData?.image_url?.includes('supabase.co/storage') ? 'upload' : 'url'
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image_url || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                alert('Image size must be less than 1MB');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const addSize = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSize.trim() && !sizes.includes(newSize.trim())) {
            setSizes([...sizes, newSize.trim()]);
            setNewSize('');
        }
    };

    const removeSize = (sizeToRemove: string) => {
        setSizes(sizes.filter(s => s !== sizeToRemove));
    };

    const addColor = () => {
        if (!colors.includes(newColor)) {
            setColors([...colors, newColor]);
        }
    };

    const removeColor = (colorToRemove: string) => {
        setColors(colors.filter(c => c !== colorToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalImageUrl = imageUrl;

            if (imageMethod === 'upload' && selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${sellerId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            }

            if (initialData) {
                const { error } = await supabase.from('products').update({
                    name,
                    description,
                    price: parseFloat(price),
                    category,
                    stock: parseInt(stock),
                    image_url: finalImageUrl,
                    sizes,
                    colors,
                }).eq('id', initialData.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from('products').insert({
                    name,
                    description,
                    price: parseFloat(price),
                    category,
                    stock: parseInt(stock),
                    image_url: finalImageUrl,
                    seller_id: sellerId,
                    sizes,
                    colors,
                });

                if (error) throw error;
            }
            onSuccess();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 sm:p-6 border-b border-surface-100 flex items-center justify-between bg-surface-50">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-surface-900 uppercase tracking-tight">
                            {initialData ? 'Edit' : 'Add New'} <span className="text-primary-600">Product</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-surface-500 mt-1">
                            {initialData ? 'Update your product information.' : 'Fill in the details to list a new item.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-surface-400 hover:text-surface-900">
                        <X size={20} className="sm:hidden" />
                        <X size={24} className="hidden sm:block" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-surface-700 ml-1">Product Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                placeholder="iPhone 15 Pro Max..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-surface-700 ml-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.slug} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-surface-700 ml-1">Price ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                placeholder="99.99"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-surface-700 ml-1">Stock Quantity</label>
                            <input
                                required
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                placeholder="50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-surface-700 ml-1">Available Sizes</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSize}
                                    onChange={(e) => setNewSize(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSize(e);
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                    placeholder="e.g. XL, 42, 1TB"
                                />
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="px-4 py-2.5 bg-surface-100 text-surface-700 rounded-xl font-bold hover:bg-surface-200 transition-all text-sm"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                {sizes.map((size) => (
                                    <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100 animate-in fade-in slide-in-from-left-2">
                                        {size}
                                        <button type="button" onClick={() => removeSize(size)} className="hover:text-primary-900 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-surface-700 ml-1">Color Options</label>

                            {/* Color Tags */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {colors.map((color) => (
                                    <div key={color} className="group relative">
                                        <div
                                            className="w-10 h-10 rounded-full border-2 border-white shadow-md transition-all hover:scale-110 cursor-default ring-1 ring-black/5"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeColor(color)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full shadow-lg border border-white opacity-0 group-hover:opacity-100 transition-all p-1"
                                        >
                                            <X size={10} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                                {colors.length === 0 && (
                                    <div className="flex h-10 items-center justify-center border-2 border-dashed border-surface-200 rounded-xl px-4 text-xs text-surface-400 italic">
                                        No colors added yet
                                    </div>
                                )}
                            </div>

                            {/* Integrated Picker */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-50 p-4 rounded-3xl border border-surface-200">
                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-surface-400 ml-1">Integrated Selection</p>
                                    <IntegratedColorPicker color={newColor} onChange={setNewColor} />
                                </div>
                                <div className="flex flex-col justify-between py-1">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest leading-none">Selected Hex</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border border-black/5 shadow-sm" style={{ backgroundColor: newColor }} />
                                                <span className="text-xl text-surface-900 font-mono uppercase font-black tracking-tight">{newColor}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-surface-400">Premium Presets</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {PRESET_COLORS.map((preset) => (
                                                    <button
                                                        key={preset.value}
                                                        type="button"
                                                        onClick={() => setNewColor(preset.value)}
                                                        className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${newColor === preset.value ? 'border-primary-600 ring-2 ring-primary-500/20' : 'border-white'}`}
                                                        style={{ backgroundColor: preset.value }}
                                                        title={preset.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addColor}
                                        className="w-full bg-surface-900 text-white rounded-2xl font-bold hover:bg-black transition-all text-sm shadow-xl shadow-surface-900/10 active:scale-95 py-4 border-2 border-surface-900 flex items-center justify-center gap-2 mt-4"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                        Add to Variations
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-surface-700 ml-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                            placeholder="Describe your product features and benefits..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-semibold text-surface-700">Product Image</label>
                            <div className="flex bg-surface-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setImageMethod('url')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${imageMethod === 'url' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500 hover:text-surface-700'}`}
                                >
                                    <Link2 size={12} /> URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageMethod('upload')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${imageMethod === 'upload' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500 hover:text-surface-700'}`}
                                >
                                    <Upload size={12} /> Upload
                                </button>
                            </div>
                        </div>

                        {imageMethod === 'url' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <input
                                        required
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => {
                                            setImageUrl(e.target.value);
                                            setPreviewUrl(e.target.value);
                                        }}
                                        className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all opacity-100"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    <p className="text-[10px] text-surface-400 ml-1 italic">Pro tip: Use Unsplash URLs for better visuals.</p>
                                </div>
                                {previewUrl && (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-surface-100 bg-surface-50 group">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-xs font-medium">Image Preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative group">
                                    <input
                                        required={!selectedFile && !initialData?.image_url}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="product-image-upload"
                                    />
                                    <label
                                        htmlFor="product-image-upload"
                                        className="flex flex-col items-center justify-center w-full min-h-[128px] transition-all bg-white border-2 border-dashed rounded-xl border-surface-200 hover:border-primary-500 hover:bg-primary-50/10 cursor-pointer group overflow-hidden"
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-full group">
                                                <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="w-6 h-6 text-white mb-1" />
                                                    <p className="text-white text-[10px] font-medium">Click to change image</p>
                                                </div>
                                                {selectedFile && (
                                                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                                                        <p className="text-[10px] text-white">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-2 text-surface-400 group-hover:text-primary-500 transition-colors" />
                                                <p className="text-sm font-medium text-surface-600">Click to upload image</p>
                                                <p className="text-[10px] text-surface-400 mt-1">PNG, JPG up to 1MB</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold text-surface-600 hover:bg-surface-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {initialData ? 'Updating...' : 'Listing Product...'}
                                </>
                            ) : (
                                <>
                                    {initialData ? <Edit2 size={20} /> : <Plus size={20} />}
                                    {initialData ? 'Update Product' : 'List Product'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
