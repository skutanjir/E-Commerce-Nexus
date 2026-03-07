interface BadgeProps {
    type: 'sale' | 'new' | 'trending' | string;
    className?: string;
}

const badgeStyles = {
    sale: 'bg-red-500 text-white',
    new: 'bg-emerald-500 text-white',
    trending: 'bg-primary-500 text-white',
};

const badgeLabels = {
    sale: 'SALE',
    new: 'NEW',
    trending: 'TRENDING',
};

export default function Badge({ type, className }: BadgeProps) {
    const isCustom = !['sale', 'new', 'trending'].includes(type);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${isCustom ? className : badgeStyles[type as keyof typeof badgeStyles]
                }`}
        >
            {isCustom ? type : badgeLabels[type as keyof typeof badgeLabels]}
        </span>
    );
}
