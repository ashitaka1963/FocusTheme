'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    error: any | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any | null>(null);

    useEffect(() => {
        // Check active sessions and sets the user
        const setData = async () => {
            if (!supabase) {
                setIsLoading(false);
                setError({ message: 'Supabase client is not initialized. Please check your environment variables.' });
                return;
            }
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error getting session:', error);
                    setError(error);
                }
                setSession(session);
                setUser(session?.user ?? null);
            } catch (err: any) {
                console.error('Failed to get session:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        setData();

        if (!supabase) return;

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            if (listener) {
                listener.subscription.unsubscribe();
            }
        };
    }, []);

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, error, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
