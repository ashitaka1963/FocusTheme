'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Mail, Lock, Chrome, Apple, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        if (!supabase) {
            setError('Supabase service is not configured. Please check your environment variables.');
            setIsLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };


    const handleOAuth = async (provider: 'google' | 'apple') => {
        setIsLoading(true);
        setError(null);

        if (!supabase) {
            setError('Supabase service is not configured.');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.backgroundGradients}>
                <div className={styles.gradient1}></div>
                <div className={styles.gradient2}></div>
                <div className={styles.gradient3}></div>
            </div>

            <h1 className={styles.title}>Focus Theme</h1>

            <div className={styles.authCard}>
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${!isSignUp ? styles.activeTab : ''}`}
                        onClick={() => setIsSignUp(false)}
                    >
                        Log In
                    </button>
                    <button
                        className={`${styles.tab} ${isSignUp ? styles.activeTab : ''}`}
                        onClick={() => setIsSignUp(true)}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleEmailAuth} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.rawInput}
                                required
                            />
                            <Mail className={styles.inputIcon} size={18} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Password</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.rawInput}
                                required
                            />
                            <Lock className={styles.inputIcon} size={18} />
                            <div className={styles.passwordToggle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {message && <p className={styles.successMessage}>{message}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? '...' : 'Continue with Email'}
                    </button>
                </form>

                <div className={styles.divider}>or</div>

                <div className={styles.oauthContainer}>
                    <button
                        className={styles.oauthButton}
                        onClick={() => handleOAuth('apple')}
                        disabled={isLoading}
                    >
                        <Apple size={18} />
                        Apple
                    </button>
                    <button
                        className={styles.oauthButton}
                        onClick={() => handleOAuth('google')}
                        disabled={isLoading}
                    >
                        <Chrome size={18} />
                        Google
                    </button>
                </div>

                <p className={styles.quote}>
                    “Find your flow. Master your focus.”
                </p>
            </div>
        </div>
    );
};
