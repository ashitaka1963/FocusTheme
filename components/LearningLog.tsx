'use client';

import React, { useState, useEffect } from 'react';
import styles from './LearningLog.module.css';
import { Button } from './ui/Button';

interface LogEntry {
    id: string;
    date: string;
    content: string;
}

interface LearningLogProps {
    themeId: string;
}

export const LearningLog: React.FC<LearningLogProps> = ({ themeId }) => {
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [newEntry, setNewEntry] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Load entries from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`learningLog_${themeId}`);
        if (stored) {
            setEntries(JSON.parse(stored));
        }
    }, [themeId]);

    // Save entries to localStorage
    const saveEntries = (newEntries: LogEntry[]) => {
        localStorage.setItem(`learningLog_${themeId}`, JSON.stringify(newEntries));
        setEntries(newEntries);
    };

    const handleAddEntry = () => {
        if (!newEntry.trim()) return;

        const today = new Date();
        const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

        const entry: LogEntry = {
            id: Date.now().toString(),
            date: dateStr,
            content: newEntry.trim(),
        };

        saveEntries([entry, ...entries]);
        setNewEntry('');
        setIsAdding(false);
    };

    const handleDeleteEntry = (id: string) => {
        saveEntries(entries.filter(e => e.id !== id));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Learning Log</h3>
                {!isAdding && (
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
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
                    />
                    <div className={styles.actions}>
                        <Button size="sm" onClick={handleAddEntry} disabled={!newEntry.trim()}>
                            Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewEntry(''); }}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className={styles.entries}>
                {entries.length === 0 && !isAdding && (
                    <p className={styles.empty}>No entries yet. Start logging your progress!</p>
                )}
                {entries.map((entry) => (
                    <div key={entry.id} className={styles.entry}>
                        <div className={styles.entryDate}>{entry.date}</div>
                        <div className={styles.entryContent}>{entry.content}</div>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteEntry(entry.id)}
                            title="Delete entry"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
