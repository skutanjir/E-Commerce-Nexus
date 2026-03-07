import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isBuyer: boolean;
    isSeller: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (
        email: string,
        password: string,
        metadata: { firstName: string; lastName: string; role: 'buyer' | 'seller'; storeName?: string }
    ) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    const signUp = async (
        email: string,
        password: string,
        metadata: { firstName: string; lastName: string; role: 'buyer' | 'seller'; storeName?: string }
    ) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: metadata.firstName,
                    last_name: metadata.lastName,
                    role: metadata.role,
                    store_name: metadata.storeName || '',
                },
            },
        });
        return { error: error?.message ?? null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const isBuyer = user?.user_metadata?.role === 'buyer';
    const isSeller = user?.user_metadata?.role === 'seller';

    return (
        <AuthContext.Provider value={{ user, session, loading, isBuyer, isSeller, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
