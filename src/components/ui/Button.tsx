import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    fullWidth?: boolean;
}

const variants = {
    primary:
        'bg-surface-900 text-white hover:bg-surface-800 shadow-lg shadow-surface-900/25 hover:shadow-xl hover:shadow-surface-900/30',
    outline:
        'border-2 border-surface-900 text-surface-900 hover:bg-surface-900 hover:text-white',
    ghost:
        'text-surface-600 hover:text-surface-900 hover:bg-surface-100',
    danger:
        'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
};

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-300 cursor-pointer
        active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}
