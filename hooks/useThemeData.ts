'use client';

import { useState, useEffect, useCallback } from 'react';
import { Theme, Resource, StorageMode, ResourceType } from '../types';
export type { Theme, Resource, StorageMode, ResourceType };
import { themeService } from '../services/themeService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const THEME_COLORS = [
    '#0ea5e9', // Sky (Default)
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#14b8a6', // Teal
];

export const useThemeData = (themeId?: string) => {
    const { user } = useAuth();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [theme, setTheme] = useState<Theme | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const envStorageMode = process.env.NEXT_PUBLIC_STORAGE_MODE;
    const storageMode: StorageMode = (envStorageMode === 'supabase' || envStorageMode === 'localstorage')
        ? envStorageMode
        : 'local';

    // Load themes when storage mode or user changes
    useEffect(() => {
        const loadThemes = async () => {
            setIsLoading(true);
            try {
                if (storageMode === 'supabase' && user) {
                    const sbThemes = await themeService.getSupabaseThemes();
                    setThemes(sbThemes);
                    if (themeId) {
                        setTheme(sbThemes.find(t => t.id === themeId) || null);
                    }
                } else {
                    const localThemes = themeService.getLocalThemes();
                    setThemes(localThemes);
                    if (themeId) {
                        setTheme(localThemes.find(t => t.id === themeId) || null);
                    }
                }
            } catch (error) {
                console.error('Failed to load themes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadThemes();
    }, [storageMode, user, themeId]);


    const createTheme = async (title: string, goal: string, startDate: string, endDate: string, color: string = THEME_COLORS[0]) => {
        if (storageMode === 'supabase' && user) {
            const newTheme = await themeService.createSupabaseTheme({ title, goal, startDate, endDate, color });
            setThemes([newTheme, ...themes]);
            return newTheme;
        } else {
            const newTheme: Theme = {
                id: Date.now().toString(),
                title,
                goal,
                startDate,
                endDate,
                createdAt: Date.now(),
                resources: [],
                totalDuration: 0,
                notes: '',
                color,
            };
            const updatedThemes = [newTheme, ...themes];
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            return newTheme;
        }
    };

    const deleteTheme = async (id: string) => {
        if (storageMode === 'supabase' && user) {
            await themeService.deleteSupabaseTheme(id);
            setThemes(themes.filter(t => t.id !== id));
        } else {
            const updatedThemes = themes.filter(t => t.id !== id);
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
        }
    };

    const addResource = async (resource: Resource) => {
        if (!theme) return;
        if (storageMode === 'supabase' && user) {
            const newResource = await themeService.addSupabaseResource({ ...resource, theme_id: theme.id });
            const updatedThemes = themes.map(t =>
                t.id === theme.id ? { ...t, resources: [...t.resources, newResource] } : t
            );
            setThemes(updatedThemes);
            setTheme({ ...theme, resources: [...theme.resources, newResource] });
        } else {
            const updatedThemes = themes.map(t =>
                t.id === theme.id ? { ...t, resources: [...t.resources, resource] } : t
            );
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            setTheme({ ...theme, resources: [...theme.resources, resource] });
        }
    };

    const removeResource = async (resourceId: string) => {
        if (!theme) return;
        if (storageMode === 'supabase' && user) {
            await themeService.deleteSupabaseResource(resourceId);
            const updatedThemes = themes.map(t =>
                t.id === theme.id ? { ...t, resources: t.resources.filter(r => r.id !== resourceId) } : t
            );
            setThemes(updatedThemes);
            setTheme({ ...theme, resources: theme.resources.filter(r => r.id !== resourceId) });
        } else {
            const updatedThemes = themes.map(t =>
                t.id === theme.id ? { ...t, resources: t.resources.filter(r => r.id !== resourceId) } : t
            );
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            setTheme({ ...theme, resources: theme.resources.filter(r => r.id !== resourceId) });
        }
    };

    const toggleResourceCompletion = async (resourceId: string) => {
        if (!theme) return;
        const targetResource = theme.resources.find(r => r.id === resourceId);
        if (!targetResource) return;

        if (storageMode === 'supabase' && user) {
            await themeService.updateSupabaseResource(resourceId, { completed: !targetResource.completed });
            const updatedThemes = themes.map(t =>
                t.id === theme.id
                    ? { ...t, resources: t.resources.map(r => r.id === resourceId ? { ...r, completed: !r.completed } : r) }
                    : t
            );
            setThemes(updatedThemes);
            setTheme({
                ...theme,
                resources: theme.resources.map(r => r.id === resourceId ? { ...r, completed: !r.completed } : r)
            });
        } else {
            const updatedThemes = themes.map(t =>
                t.id === theme.id
                    ? { ...t, resources: t.resources.map(r => r.id === resourceId ? { ...r, completed: !r.completed } : r) }
                    : t
            );
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            setTheme({
                ...theme,
                resources: theme.resources.map(r => r.id === resourceId ? { ...r, completed: !r.completed } : r)
            });
        }
    };

    const updateNotes = async (notes: string) => {
        if (!theme) return;
        if (storageMode === 'supabase' && user) {
            await themeService.updateSupabaseTheme(theme.id, { notes });
            setThemes(themes.map(t => t.id === theme.id ? { ...t, notes } : t));
            setTheme({ ...theme, notes });
        } else {
            const updatedThemes = themes.map(t => t.id === theme.id ? { ...t, notes } : t);
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            setTheme({ ...theme, notes });
        }
    };

    const updateThemeGoal = async (id: string, goal: string) => {
        if (storageMode === 'supabase' && user) {
            await themeService.updateSupabaseTheme(id, { goal });
            setThemes(themes.map(t => t.id === id ? { ...t, goal } : t));
            if (theme?.id === id) setTheme({ ...theme, goal });
        } else {
            const updatedThemes = themes.map(t => t.id === id ? { ...t, goal } : t);
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            if (theme?.id === id) setTheme({ ...theme, goal });
        }
    };

    const updateThemeDates = async (id: string, startDate: string, endDate: string) => {
        if (storageMode === 'supabase' && user) {
            await themeService.updateSupabaseTheme(id, { startDate, endDate });
            setThemes(themes.map(t => t.id === id ? { ...t, startDate, endDate } : t));
            if (theme?.id === id) setTheme({ ...theme, startDate, endDate });
        } else {
            const updatedThemes = themes.map(t => t.id === id ? { ...t, startDate, endDate } : t);
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            if (theme?.id === id) setTheme({ ...theme, startDate, endDate });
        }
    };

    const updateThemeColor = async (id: string, color: string) => {
        if (storageMode === 'supabase' && user) {
            await themeService.updateSupabaseTheme(id, { color });
            setThemes(themes.map(t => t.id === id ? { ...t, color } : t));
            if (theme?.id === id) setTheme({ ...theme, color });
        } else {
            const updatedThemes = themes.map(t => t.id === id ? { ...t, color } : t);
            themeService.saveLocalThemes(updatedThemes);
            setThemes(updatedThemes);
            if (theme?.id === id) setTheme({ ...theme, color });
        }
    };

    return {
        themes,
        theme,
        isLoading,
        storageMode,
        createTheme,
        deleteTheme,
        addResource,
        removeResource,
        toggleResourceCompletion,
        updateNotes,
        updateThemeGoal,
        updateThemeDates,
        updateThemeColor,
    };
};

