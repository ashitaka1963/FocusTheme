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

            <Card className={styles.authCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Focus Theme</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? 'Create your account to start learning' : 'Welcome back, focus on your growth'}
                    </p>
                </div>

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
                        <Input
                            type="email"
                            placeholder="hello@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <Mail className={styles.inputIcon} size={20} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <Lock className={styles.inputIcon} size={20} />
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {message && <p className={styles.successMessage}>{message}</p>}

                    <Button
                        type="submit"
                        className={styles.submitButton}
                        isLoading={isLoading}
                        size="lg"
                    >
                        {isSignUp ? 'Get Started' : 'Sign In'}
                    </Button>
                </form>

                <div className={styles.divider}>or</div>

                <div className={styles.oauthContainer}>
                    <Button
                        variant="ghost"
                        className={styles.oauthButton}
                        onClick={() => handleOAuth('google')}
                        disabled={isLoading}
                    >
                        <Chrome size={20} className={styles.providerIcon} />
                        Google
                    </Button>
                    <Button
                        variant="ghost"
                        className={styles.oauthButton}
                        onClick={() => handleOAuth('apple')}
                        disabled={isLoading}
                    >
                        <Apple size={20} className={styles.providerIcon} />
                        Apple
                    </Button>
                </div>

                <p className={styles.quote}>
                    “Find your flow. Master your focus.”
                </p>
            </Card>
        </div>
    );
};
