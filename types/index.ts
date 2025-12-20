export type ResourceType = 'web' | 'book' | 'video' | 'article' | 'podcast' | 'other';

export interface Resource {
    id: string;
    theme_id?: string;
    title: string;
    url?: string;
    type: ResourceType;
    completed: boolean;
    created_at?: string;
}

export interface Theme {
    id: string;
    user_id?: string;
    title: string;
    goal: string;
    startDate: string;
    endDate: string;
    createdAt: number;
    resources: Resource[];
    totalDuration: number;
    notes: string;
    color: string;
}

export type StorageMode = 'local' | 'supabase' | 'localstorage';
