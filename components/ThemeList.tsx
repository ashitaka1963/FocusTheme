'use client';

import React from 'react';
import Link from 'next/link';
import styles from './ThemeList.module.css';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressBar } from './ProgressBar';
import { Theme } from '@/hooks/useThemeData';
import { StatsWidget } from './StatsWidget';
import { Timeline } from './Timeline';

interface ThemeListProps {
    themes: Theme[];
    onDelete: (id: string) => void;
}

const isThemeActive = (theme: Theme): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(theme.startDate);
    const endDate = new Date(theme.endDate);

    return today >= startDate && today <= endDate;
};

const getRemainingDays = (theme: Theme): number | null => {
    if (!isThemeActive(theme)) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(theme.endDate);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 ? diffDays : null;
};

const formatDisplayDate = (dateStr: string): string => {
    return dateStr.replace(/-/g, '/');
};

export const ThemeList: React.FC<ThemeListProps> = ({ themes, onDelete }) => {
    if (themes.length === 0) return null;

    // Sort themes: active first, then by creation date (newest first)
    const sortedThemes = [...themes].sort((a, b) => {
        const aActive = isThemeActive(a);
        const bActive = isThemeActive(b);

        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        return b.createdAt - a.createdAt;
    });

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Your Learning History</h2>

            <StatsWidget themes={themes} />
            <Timeline themes={themes} />

            <div className={styles.list}>
                {sortedThemes.map((theme) => {
                    const isActive = isThemeActive(theme);
                    const remainingDays = getRemainingDays(theme);
                    const completedCount = theme.resources.filter(r => r.completed).length;
                    const totalCount = theme.resources.length;
                    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                    return (
                        <Link key={theme.id} href={`/dashboard?id=${theme.id}`} className={styles.card}>
                            <Card hoverable className={`h-full ${isActive ? styles.activeCard : ''}`}>
                                {isActive && <div className={styles.activeBadge}>Active</div>}

                                <div className={styles.cardContent}>
                                    <div className={styles.header}>
                                        <div className={styles.themeTitle}>{theme.title}</div>
                                    </div>

                                    <div className={styles.dates}>
                                        {formatDisplayDate(theme.startDate)} - {formatDisplayDate(theme.endDate)}
                                        {remainingDays !== null && (
                                            <span className={styles.remainingDays}>
                                                {' • '}{remainingDays} days left
                                            </span>
                                        )}
                                    </div>

                                    {theme.goal && (
                                        <div className={styles.goalPreview}>
                                            "{theme.goal}"
                                        </div>
                                    )}

                                    <div className={styles.progressSection}>
                                        <ProgressBar
                                            value={progress}
                                            label={`${completedCount} / ${totalCount} resources`}
                                        />
                                    </div>
                                </div>

                                <div
                                    className={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this theme?')) {
                                            onDelete(theme.id);
                                        }
                                    }}
                                >
                                    <Button variant="ghost" size="sm">×</Button>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
