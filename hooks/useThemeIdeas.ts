'use client';

import { useState, useEffect } from 'react';
import { ThemeIdea, StorageMode } from '../types';
import { themeService } from '../services/themeService';
import { useAuth } from '../context/AuthContext';

export const useThemeIdeas = () => {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState<ThemeIdea[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const envStorageMode = process.env.NEXT_PUBLIC_STORAGE_MODE;
    const storageMode: StorageMode = (envStorageMode === 'supabase' || envStorageMode === 'localstorage')
        ? envStorageMode
        : 'local';

    useEffect(() => {
        const loadIdeas = async () => {
            setIsLoading(true);
            try {
                if (storageMode === 'supabase') {
                    if (!user) return;
                    const sbIdeas = await themeService.getSupabaseIdeas();
                    setIdeas(sbIdeas);
                } else {
                    const localIdeas = themeService.getLocalIdeas();
                    setIdeas(localIdeas);
                }
            } catch (error) {
                console.error('Failed to load ideas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadIdeas();
    }, [storageMode, user]);

    const addIdea = async (content: string) => {
        if (!content.trim()) return;

        if (storageMode === 'supabase' && user) {
            const newIdea = await themeService.createSupabaseIdea(content);
            setIdeas([newIdea, ...ideas]);
            return newIdea;
        } else {
            const newIdea: ThemeIdea = {
                id: Date.now().toString(),
                content,
                createdAt: Date.now(),
            };
            const updatedIdeas = [newIdea, ...ideas];
            themeService.saveLocalIdeas(updatedIdeas);
            setIdeas(updatedIdeas);
            return newIdea;
        }
    };

    const deleteIdea = async (id: string) => {
        if (storageMode === 'supabase' && user) {
            await themeService.deleteSupabaseIdea(id);
            setIdeas(ideas.filter(i => i.id !== id));
        } else {
            const updatedIdeas = ideas.filter(i => i.id !== id);
            themeService.saveLocalIdeas(updatedIdeas);
            setIdeas(updatedIdeas);
        }
    };

    return {
        ideas,
        isLoading,
        addIdea,
        deleteIdea,
    };
};
