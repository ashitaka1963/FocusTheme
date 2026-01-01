'use client';

import React, { useState } from 'react';
import { useThemeIdeas } from '@/hooks/useThemeIdeas';
import styles from './ThemeIdeaList.module.css';
import { Lightbulb, Trash2, Plus, Loader2, ArrowUpRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ThemeIdeaListProps {
    onSelectIdea?: (content: string) => void;
}

export const ThemeIdeaList: React.FC<ThemeIdeaListProps> = ({ onSelectIdea }) => {
    const { ideas, isLoading, addIdea, deleteIdea } = useThemeIdeas();
    const [newIdea, setNewIdea] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIdea.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addIdea(newIdea.trim());
            setNewIdea('');
        } catch (error) {
            console.error('Failed to add idea:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading && ideas.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} />
                    <span>Loading ideas...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <Lightbulb className={styles.titleIcon} size={24} />
                    Theme Ideas
                </h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.inputForm}>
                <Input
                    placeholder="Capture a spark of inspiration..."
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    disabled={isSubmitting}
                    className={styles.input}
                />
                <Button
                    type="submit"
                    disabled={!newIdea.trim() || isSubmitting}
                    isLoading={isSubmitting}
                >
                    <Plus size={18} />
                    Add
                </Button>
            </form>

            {ideas.length === 0 ? (
                <Card className={styles.emptyState}>
                    <Lightbulb className={styles.emptyIcon} size={48} />
                    <p>No ideas banked yet. Start capturing your learning inspirations!</p>
                </Card>
            ) : (
                <div className={styles.grid}>
                    {ideas.map((idea) => (
                        <Card key={idea.id} hoverable className={styles.ideaCard}>
                            <div className={styles.cardDecoration}>
                                <Lightbulb size={80} strokeWidth={1} />
                            </div>
                            <p className={styles.content}>{idea.content}</p>
                            <div className={styles.footer}>
                                {onSelectIdea && (
                                    <button
                                        onClick={() => onSelectIdea(idea.content)}
                                        className={styles.useIdeaBtn}
                                        title="Start a theme with this idea"
                                    >
                                        <ArrowUpRight size={16} />
                                        <span>Use This</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteIdea(idea.id)}
                                    className={styles.deleteBtn}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

