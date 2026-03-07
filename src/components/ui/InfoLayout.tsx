import React from 'react';
import { motion } from 'framer-motion';

interface InfoLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export default function InfoLayout({ title, subtitle, children }: InfoLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-surface-950 py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-[80px] -ml-36 -mb-36" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-surface-400 max-w-2xl mx-auto"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-lg prose-surface max-w-none"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
