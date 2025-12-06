'use client';

import React, { useState, useEffect } from 'react';
import styles from './Notes.module.css';
import { Button } from './ui/Button';
import { Theme } from '@/hooks/useThemeData';

interface NotesProps {
    theme: Theme;
    updateNotes: (notes: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ theme, updateNotes }) => {
    const [value, setValue] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setValue(theme.notes || '');
        setIsDirty(false);
    }, [theme.id]); // Only reset when theme ID changes

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        setIsDirty(true);
    };

    const handleSave = () => {
        updateNotes(value);
        setIsDirty(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Notes</h3>
                <Button size="sm" onClick={handleSave} disabled={!isDirty}>
                    {isDirty ? 'Save Changes' : 'Saved'}
                </Button>
            </div>
            <textarea
                className={styles.textarea}
                placeholder="Write down what you learned..."
                value={value}
                onChange={handleChange}
            />
            <div className={styles.status}>
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </div>
        </div>
    );
};
