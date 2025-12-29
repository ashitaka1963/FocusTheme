'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useThemeData } from '@/hooks/useThemeData';
import { useAuth } from '@/context/AuthContext';
import { Auth } from '@/components/Auth';
import { FocusMode } from '@/components/ambient/FocusMode';

function FocusPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const themeId = searchParams.get('id');
    const { theme, isLoading, storageMode } = useThemeData(themeId || undefined);
    const { user, isLoading: isAuthLoading, error: authError } = useAuth();

    if (storageMode === 'supabase' && isAuthLoading) {
        return <div style={{ background: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading session...</div>;
    }

    if (storageMode === 'supabase' && (!user || authError)) {
        return <Auth />;
    }

    if (isLoading && !theme) {
        return <div style={{ background: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;
    }

    if (!theme) {
        return (
            <div style={{ background: '#0f172a', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '20px' }}>
                <h1>Theme not found</h1>
                <button
                    onClick={() => router.push('/')}
                    style={{ padding: '10px 20px', background: '#0ea5e9', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <FocusMode
            theme={theme}
            storageMode={storageMode}
            onClose={() => router.push(`/dashboard?id=${theme.id}`)}
        />
    );
}

export default function FocusPage() {
    return (
        <Suspense fallback={<div style={{ background: '#0f172a', height: '100vh' }}></div>}>
            <FocusPageContent />
        </Suspense>
    );
}
