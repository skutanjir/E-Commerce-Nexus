import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Product } from '../types/database';
import { useNavigate } from 'react-router-dom';

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (product: Product) => Promise<void>;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('favorites')
                    .select('product_id')
                    .eq('user_id', user.id);

                if (error) throw error;
                setFavorites(data.map(f => f.product_id));
            } catch (err) {
                console.error('Error fetching favorites:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const isFavorite = (productId: string) => favorites.includes(productId);

    const toggleFavorite = async (product: Product) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const currentlyFavorite = isFavorite(product.id);

        // Optimistic update
        if (currentlyFavorite) {
            setFavorites(prev => prev.filter(id => id !== product.id));
        } else {
            setFavorites(prev => [...prev, product.id]);
        }

        try {
            if (currentlyFavorite) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', product.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, product_id: product.id });
                if (error) throw error;
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            // Rollback on error
            if (currentlyFavorite) {
                setFavorites(prev => [...prev, product.id]);
            } else {
                setFavorites(prev => prev.filter(id => id !== product.id));
            }
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
