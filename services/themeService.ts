import { supabase } from '../lib/supabase';
import { Theme, Resource, StorageMode } from '../types';

const STORAGE_KEY = 'focus_theme_data';

export const themeService = {
    // LocalStorage logic
    getLocalThemes(): Theme[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            console.error('Failed to parse local themes', e);
            return [];
        }
    },

    saveLocalThemes(themes: Theme[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
    },

    // Supabase logic
    async getSupabaseThemes(): Promise<Theme[]> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { data: themesData, error: themesError } = await supabase
            .from('themes')
            .select(`
        *,
        resources (*)
      `)
            .order('created_at', { ascending: false });

        if (themesError) throw themesError;

        return themesData.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            title: t.title,
            goal: t.goal || '',
            startDate: t.start_date,
            endDate: t.end_date,
            createdAt: new Date(t.created_at).getTime(),
            totalDuration: t.total_duration || 0,
            notes: t.notes || '',
            color: t.color || '#0ea5e9',
            resources: t.resources.map((r: any) => ({
                id: r.id,
                theme_id: r.theme_id,
                title: r.title,
                url: r.url || undefined,
                type: r.type,
                completed: r.completed,
                created_at: r.created_at
            }))
        }));
    },

    async createSupabaseTheme(theme: Partial<Theme>): Promise<Theme> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('themes')
            .insert({
                user_id: user.id,
                title: theme.title,
                goal: theme.goal,
                start_date: theme.startDate,
                end_date: theme.endDate,
                color: theme.color,
                notes: theme.notes
            })
            .select()
            .single();

        if (error) throw error;

        return {
            ...theme,
            id: data.id,
            user_id: data.user_id,
            createdAt: new Date(data.created_at).getTime(),
            resources: []
        } as Theme;
    },

    async updateSupabaseTheme(id: string, updates: Partial<Theme>): Promise<void> {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.totalDuration !== undefined) dbUpdates.total_duration = updates.totalDuration;

        if (!supabase) throw new Error('Supabase client is not initialized');
        const { error } = await supabase
            .from('themes')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteSupabaseTheme(id: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { error } = await supabase
            .from('themes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async addSupabaseResource(resource: Partial<Resource>): Promise<Resource> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { data, error } = await supabase
            .from('resources')
            .insert({
                theme_id: resource.theme_id,
                title: resource.title,
                url: resource.url,
                type: resource.type,
                completed: resource.completed
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            theme_id: data.theme_id,
            title: data.title,
            url: data.url,
            type: data.type,
            completed: data.completed,
            created_at: data.created_at
        };
    },

    async updateSupabaseResource(id: string, updates: Partial<Resource>): Promise<void> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { error } = await supabase
            .from('resources')
            .update({
                title: updates.title,
                url: updates.url,
                type: updates.type,
                completed: updates.completed
            })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteSupabaseResource(id: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Learning Log logic
    getLocalLogs(themeId: string): any[] {
        const stored = localStorage.getItem(`learningLog_${themeId}`);
        return stored ? JSON.parse(stored) : [];
    },

    saveLocalLogs(themeId: string, logs: any[]) {
        localStorage.setItem(`learningLog_${themeId}`, JSON.stringify(logs));
    },

    async getSupabaseLogs(themeId: string): Promise<any[]> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { data, error } = await supabase
            .from('learning_logs')
            .select('*')
            .eq('theme_id', themeId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data.map(log => ({
            id: log.id,
            date: log.date.replace(/-/g, '/'),
            content: log.content
        }));
    },

    async createSupabaseLog(themeId: string, content: string): Promise<any> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { data, error } = await supabase
            .from('learning_logs')
            .insert({
                theme_id: themeId,
                content: content
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            date: data.date.replace(/-/g, '/'),
            content: data.content
        };
    },

    async deleteSupabaseLog(id: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client is not initialized');
        const { error } = await supabase
            .from('learning_logs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
