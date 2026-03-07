import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Github, Twitter, Instagram } from 'lucide-react';

const footerLinks = {
    Shop: [
        { label: 'All Products', to: '/shop' },
        { label: 'Electronics', to: '/shop?category=Electronics' },
        { label: 'Clothing', to: '/shop?category=Clothing' },
        { label: 'Accessories', to: '/shop?category=Accessories' },
        { label: 'Shoes', to: '/shop?category=Shoes' },
    ],
    Company: [
        { label: 'About Us', to: '/about' },
        { label: 'Careers', to: '/careers' },
        { label: 'Blog', to: '/blog' },
        { label: 'Press', to: '/press' },
    ],
    Support: [
        { label: 'Help Center', to: '/help' },
        { label: 'Shipping', to: '/shipping' },
        { label: 'Returns', to: '/returns' },
        { label: 'Size Guide', to: '/size-guide' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-surface-900 text-surface-300">

            {/* Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="text-2xl font-display font-bold text-white">
                            Nuxes
                        </Link>
                        <p className="text-surface-400 text-sm mt-4 leading-relaxed">
                            Curated premium products for the modern lifestyle. Quality craftsmanship meets contemporary design.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <a href="#" className="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Github size={16} />
                            </a>
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-semibold text-white mb-4">{title}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-surface-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-surface-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-surface-500">
                            © 2026 Nuxes. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-surface-500">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                <span>Jakarta, Indonesia</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>+62 812 3456 789</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span>hello@nuxes.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
