import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, MapPin, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import { loadSnapJs, createMidtransTransaction, payWithSnap } from '../lib/midtrans';

const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Package },
];

export default function Checkout() {
    const { user } = useAuth();
    const { state, totalPrice, dispatch } = useCart();
    const [currentStep, setCurrentStep] = useState(1);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        zipCode: ''
    });

    useEffect(() => {
        loadSnapJs().catch(console.error);
    }, []);

    const shipping = totalPrice > 100 ? 0 : 9.99;
    const tax = totalPrice * 0.1;
    const total = totalPrice + shipping + tax;

    const handlePlaceOrder = async () => {
        try {
            setIsPaying(true);
            const orderId = `LX-${Date.now()}`;
            // Use the USD total directly
            const grossAmount = Math.round(total);

            const customerDetails = {
                first_name: shippingInfo.firstName,
                last_name: shippingInfo.lastName,
                email: shippingInfo.email,
                billing_address: {
                    first_name: shippingInfo.firstName,
                    last_name: shippingInfo.lastName,
                    email: shippingInfo.email,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    postal_code: shippingInfo.zipCode,
                    country_code: 'IDN'
                },
                shipping_address: {
                    first_name: shippingInfo.firstName,
                    last_name: shippingInfo.lastName,
                    email: shippingInfo.email,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    postal_code: shippingInfo.zipCode,
                    country_code: 'IDN'
                }
            };

            // Generate real Snap token
            const token = await createMidtransTransaction(orderId, grossAmount, customerDetails);

            payWithSnap(token, {
                onSuccess: async (result) => {
                    console.log('Payment success:', result);

                    try {
                        // 1. Create the order in Supabase
                        const { data: orderData, error: orderError } = await supabase
                            .from('orders')
                            .insert({
                                user_id: user?.id,
                                total_amount: total,
                                status: 'Paid',
                                shipping_address: `${shippingInfo.firstName} ${shippingInfo.lastName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}`,
                            })
                            .select()
                            .single();

                        if (orderError) throw orderError;

                        // 2. Create order items
                        const orderItems = state.items.map(item => ({
                            order_id: orderData.id,
                            product_id: item.product.id,
                            quantity: item.quantity,
                            price_at_time: item.product.price
                        }));

                        const { error: itemsError } = await supabase
                            .from('order_items')
                            .insert(orderItems);

                        if (itemsError) throw itemsError;

                        // 3. Decrement stock for each item
                        for (const item of state.items) {
                            await supabase.rpc('decrement_stock', {
                                product_id: item.product.id,
                                amount: item.quantity
                            });
                        }
                    } catch (err) {
                        console.error('Error recording order or updating stock:', err);
                    }

                    setOrderPlaced(true);
                    dispatch({ type: 'CLEAR_CART' });
                    setIsPaying(false);
                },
                onPending: (result) => {
                    console.log('Payment pending:', result);
                    setIsPaying(false);
                },
                onError: (result) => {
                    console.error('Payment error:', result);
                    setIsPaying(false);
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    setIsPaying(false);
                }
            });
        } catch (err) {
            console.error('Failed to start Midtrans payment:', err);
            setIsPaying(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-emerald-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-surface-900 mb-3">Order Placed!</h1>
                    <p className="text-surface-500 mb-8">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                    <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-surface-900 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors">
                        Continue Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-display font-bold text-surface-900 mb-3">No Items to Checkout</h1>
                    <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">Go to Shop</Link>
                </div>
            </div>
        );
    }

    const inputCls = "w-full px-4 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all";

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-display font-bold text-surface-900 mb-8">Checkout</h1>

                {/* Steps */}
                <div className="flex items-center mb-12">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${currentStep >= step.id ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-400'}`}>
                                    {currentStep > step.id ? <Check size={18} /> : <step.icon size={18} />}
                                </div>
                                <span className={`hidden sm:block text-sm font-medium ${currentStep >= step.id ? 'text-surface-900' : 'text-surface-400'}`}>{step.name}</span>
                            </div>
                            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 rounded ${currentStep > step.id ? 'bg-surface-900' : 'bg-surface-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        {currentStep === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-surface-900 mb-6">Shipping Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-surface-700 mb-1.5">First Name</label><input type="text" value={shippingInfo.firstName} onChange={e => setShippingInfo({ ...shippingInfo, firstName: e.target.value })} className={inputCls} /></div>
                                    <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Last Name</label><input type="text" value={shippingInfo.lastName} onChange={e => setShippingInfo({ ...shippingInfo, lastName: e.target.value })} className={inputCls} /></div>
                                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label><input type="email" value={shippingInfo.email} onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })} className={inputCls} /></div>
                                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1.5">Address</label><input type="text" value={shippingInfo.address} onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })} className={inputCls} /></div>
                                    <div><label className="block text-sm font-medium text-surface-700 mb-1.5">City</label><input type="text" value={shippingInfo.city} onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })} className={inputCls} /></div>
                                    <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Zip Code</label><input type="text" value={shippingInfo.zipCode} onChange={e => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })} className={inputCls} /></div>
                                </div>
                                <div className="flex justify-end mt-6"><Button onClick={() => setCurrentStep(2)}>Continue to Payment</Button></div>
                            </motion.div>
                        )}
                        {currentStep === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-surface-900 mb-6">Payment Method</h2>
                                <div className="p-4 border border-surface-200 rounded-xl bg-surface-50 text-surface-700 mb-6 flex items-center gap-4">
                                    <CreditCard className="text-primary-500" size={24} />
                                    <div>
                                        <p className="font-semibold text-sm">Secure Payment with Midtrans</p>
                                        <p className="text-xs text-surface-500 mt-0.5">You will be securely redirected to Midtrans to complete your payment.</p>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-6">
                                    <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
                                    <Button onClick={() => setCurrentStep(3)}>Review Order</Button>
                                </div>
                            </motion.div>
                        )}
                        {currentStep === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-surface-900 mb-6">Review Your Order</h2>
                                <div className="space-y-4">
                                    {state.items.map((item) => (
                                        <div key={item.product.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-50">
                                            <img src={item.product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                                                <p className="text-xs text-surface-400">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-6">
                                    <Button variant="ghost" onClick={() => setCurrentStep(2)} disabled={isPaying}>Back</Button>
                                    <Button onClick={handlePlaceOrder} disabled={isPaying}>
                                        {isPaying ? 'Processing...' : `Pay with Midtrans — $${total.toFixed(2)}`}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                            <h2 className="text-lg font-bold text-surface-900 mb-4">Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span className="font-medium">${totalPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-500">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                                <div className="flex justify-between"><span className="text-surface-500">Tax</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                                <div className="border-t border-surface-100 pt-3"><div className="flex justify-between"><span className="font-bold">Total</span><span className="font-bold">${total.toFixed(2)}</span></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
