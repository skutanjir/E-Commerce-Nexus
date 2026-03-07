import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
            setError(signInError);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
                    alt="Store"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-surface-900/60 flex items-center justify-center">
                    <div className="text-center px-12">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">Welcome Back</h2>
                        <p className="text-white/70 text-lg">Sign in to access your account and continue shopping.</p>
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <Link to="/" className="text-3xl font-display font-bold gradient-text mb-2 block">Nuxes</Link>
                    <h1 className="text-2xl font-bold text-surface-900 mt-6 mb-2">Sign In</h1>
                    <p className="text-surface-500 mb-8">Welcome back! Please enter your details.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-surface-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500" />
                                <span className="text-sm text-surface-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot password?</a>
                        </div>
                        <Button type="submit" fullWidth size="lg" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-surface-500 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Sign Up</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
