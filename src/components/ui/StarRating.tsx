import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    size?: number;
}

export default function StarRating({ rating, size = 16 }: StarRatingProps) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={
                        star <= Math.round(rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-surface-200 text-surface-200'
                    }
                />
            ))}
        </div>
    );
}
