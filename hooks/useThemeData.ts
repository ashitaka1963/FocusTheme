'use client';

import { useState, useEffect } from 'react';

export type ResourceType = 'web' | 'book' | 'video' | 'article' | 'podcast' | 'other';

export interface Resource {
    id: string;
    title: string;
    url?: string;
    type: ResourceType;
    completed: boolean;
}

export interface Theme {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    createdAt: number;
    resources: Resource[];
    totalDuration: number;
    notes: string;
    color: string;
}

const STORAGE_KEY = 'focus_theme_data';

// Default theme colors
const THEME_COLORS = [
    '#0ea5e9', // Sky (Default)
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#14b8a6', // Teal
];

export const useThemeData = (themeId?: string) => {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [theme, setTheme] = useState<Theme | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load themes from storage
    useEffect(() => {
        const loadThemes = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);

                    let loadedThemes: Theme[] = [];
                    if (Array.isArray(parsed)) {
                        loadedThemes = parsed;
                    } else if (parsed && typeof parsed === 'object') {
                        loadedThemes = [parsed];
                    }

                    // Migration: Ensure all fields exist
                    loadedThemes = loadedThemes.map((t, index) => ({
                        ...t,
                        notes: t.notes || '',
                        color: t.color || THEME_COLORS[index % THEME_COLORS.length], // Assign default color if missing
                        resources: t.resources.map(r => ({
                            ...r,
                            completed: r.completed || false,
                            type: r.type || 'web', // Default to 'web' for old resources
                            url: r.url || undefined
                        }))
                    }));

                    setThemes(loadedThemes);

                    if (themeId) {
                        const found = loadedThemes.find((t) => t.id === themeId);
                        setTheme(found || null);
                    }
                }
            } catch (error) {
                console.error('Failed to load theme data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadThemes();
    }, [themeId]);

    // Save all themes to storage
    const saveThemes = (newThemes: Theme[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newThemes));
            setThemes(newThemes);

            if (themeId) {
                const found = newThemes.find((t) => t.id === themeId);
                setTheme(found || null);
            }
        } catch (error) {
            console.error('Failed to save theme data:', error);
        }
    };

    const createTheme = (title: string, startDate: string, endDate: string, color: string = THEME_COLORS[0]) => {
        const newTheme: Theme = {
            id: Date.now().toString(),
            title,
            startDate,
            endDate,
            createdAt: Date.now(),
            resources: [],
            totalDuration: 0,
            notes: '',
            color,
        };
        const updatedThemes = [newTheme, ...themes];
        saveThemes(updatedThemes);
        return newTheme;
    };

    const deleteTheme = (id: string) => {
        const updatedThemes = themes.filter((t) => t.id !== id);
        saveThemes(updatedThemes);
    };

    const addResource = (resource: Resource) => {
        if (!theme) return;
        const updatedThemes = themes.map((t) =>
            t.id === theme.id
                ? { ...t, resources: [...t.resources, resource] }
                : t
        );
        saveThemes(updatedThemes);
    };

    const removeResource = (resourceId: string) => {
        if (!theme) return;
        const updatedThemes = themes.map((t) =>
            t.id === theme.id
                ? { ...t, resources: t.resources.filter((r) => r.id !== resourceId) }
                : t
        );
        saveThemes(updatedThemes);
    };

    const toggleResourceCompletion = (resourceId: string) => {
        if (!theme) return;
        const updatedThemes = themes.map((t) =>
            t.id === theme.id
                ? {
                    ...t,
                    resources: t.resources.map(r =>
                        r.id === resourceId ? { ...r, completed: !r.completed } : r
                    )
                }
                : t
        );
        saveThemes(updatedThemes);
    };

    const updateNotes = (notes: string) => {
        if (!theme) return;
        const updatedThemes = themes.map((t) =>
            t.id === theme.id
                ? { ...t, notes }
                : t
        );
        saveThemes(updatedThemes);
    };

    const updateThemeDates = (themeId: string, startDate: string, endDate: string) => {
        const updatedThemes = themes.map((t) =>
            t.id === themeId
                ? { ...t, startDate, endDate }
                : t
        );
        saveThemes(updatedThemes);
    };

    const updateThemeColor = (themeId: string, color: string) => {
        const updatedThemes = themes.map((t) =>
            t.id === themeId
                ? { ...t, color }
                : t
        );
        saveThemes(updatedThemes);
    };

    return {
        themes,
        theme,
        isLoading,
        createTheme,
        deleteTheme,
        addResource,
        removeResource,
        toggleResourceCompletion,
        updateNotes,
        updateThemeDates,
        updateThemeColor,
    };
};
