import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
    const [storeName, setStoreName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: signUpError } = await signUp(email, password, {
            firstName,
            lastName,
            role,
            storeName: role === 'seller' ? storeName : undefined
        });

        if (signUpError) {
            setError(signUpError);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80" alt="Store" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-surface-900/80 to-primary-900/60 flex items-center justify-center">
                    <div className="text-center px-12">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">Join Nuxes</h2>
                        <p className="text-white/70 text-lg">Create an account to get exclusive deals and track your orders.</p>
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <Link to="/" className="text-3xl font-display font-bold gradient-text mb-2 block">Nuxes</Link>
                    <h1 className="text-2xl font-bold text-surface-900 mt-6 mb-2">Create Account</h1>
                    <p className="text-surface-500 mb-8">Sign up to start your premium shopping experience.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div className="flex bg-surface-100 p-1 rounded-xl mb-4">
                            <button
                                type="button"
                                onClick={() => setRole('buyer')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${role === 'buyer' ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'}`}
                            >
                                Buyer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('seller')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${role === 'seller' ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'}`}
                            >
                                Seller
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {role === 'seller' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Store Name</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Your Store Name"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        required={role === 'seller'}
                                    />
                                </div>
                            </motion.div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-surface-300 text-primary-500 focus:ring-primary-500" />
                            <span className="text-sm text-surface-600">I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a></span>
                        </label>
                        <Button type="submit" fullWidth size="lg" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-surface-500 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
