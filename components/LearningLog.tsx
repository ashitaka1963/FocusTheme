'use client';

import React, { useState, useEffect } from 'react';
import styles from './LearningLog.module.css';
import { Button } from './ui/Button';
import { themeService } from '../services/themeService';
import { useThemeData } from '../hooks/useThemeData';
import { useAuth } from '../context/AuthContext';

interface LogEntry {
    id: string;
    date: string;
    content: string;
}

interface LearningLogProps {
    themeId: string;
}

export const LearningLog: React.FC<LearningLogProps> = ({ themeId }) => {
    const { storageMode } = useThemeData();
    const { user } = useAuth();
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [newEntry, setNewEntry] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load entries
    useEffect(() => {
        const loadEntries = async () => {
            setIsLoading(true);
            try {
                if (storageMode === 'supabase' && user) {
                    const sbLogs = await themeService.getSupabaseLogs(themeId);
                    setEntries(sbLogs);
                } else {
                    const localLogs = themeService.getLocalLogs(themeId);
                    setEntries(localLogs);
                }
            } catch (err) {
                console.error('Failed to load logs:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadEntries();
    }, [themeId, storageMode, user]);

    const handleAddEntry = async () => {
        if (!newEntry.trim()) return;
        setIsLoading(true);

        try {
            if (storageMode === 'supabase' && user) {
                const entry = await themeService.createSupabaseLog(themeId, newEntry.trim());
                setEntries([entry, ...entries]);
            } else {
                const today = new Date();
                const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

                const entry: LogEntry = {
                    id: Date.now().toString(),
                    date: dateStr,
                    content: newEntry.trim(),
                };

                const newEntries = [entry, ...entries];
                themeService.saveLocalLogs(themeId, newEntries);
                setEntries(newEntries);
            }
            setNewEntry('');
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to add entry:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        setIsLoading(true);
        try {
            if (storageMode === 'supabase' && user) {
                await themeService.deleteSupabaseLog(id);
                setEntries(entries.filter(e => e.id !== id));
            } else {
                const newEntries = entries.filter(e => e.id !== id);
                themeService.saveLocalLogs(themeId, newEntries);
                setEntries(newEntries);
            }
        } catch (err) {
            console.error('Failed to delete entry:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Learning Log</h3>
                {!isAdding && (
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} disabled={isLoading}>
                        + Add
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className={styles.addForm}>
                    <textarea
                        className={styles.textarea}
                        placeholder="What did you learn today?"
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        rows={2}
                        autoFocus
                        disabled={isLoading}
                    />
                    <div className={styles.actions}>
                        <Button size="sm" onClick={handleAddEntry} disabled={!newEntry.trim() || isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewEntry(''); }} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className={styles.entries}>
                {entries.length === 0 && !isAdding && !isLoading && (
                    <p className={styles.empty}>No entries yet. Start logging your progress!</p>
                )}
                {isLoading && entries.length === 0 && <p className={styles.empty}>Loading...</p>}
                {entries.map((entry) => (
                    <div key={entry.id} className={styles.entry}>
                        <div className={styles.entryDate}>{entry.date}</div>
                        <div className={styles.entryContent}>{entry.content}</div>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteEntry(entry.id)}
                            title="Delete entry"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
