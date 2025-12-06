'use client';

import React from 'react';
import styles from './StatsWidget.module.css';
import { Theme } from '@/hooks/useThemeData';

interface StatsWidgetProps {
    themes: Theme[];
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ themes }) => {
    if (themes.length === 0) return null;

    const totalThemes = themes.length;

    const totalResources = themes.reduce((acc, theme) => acc + theme.resources.length, 0);

    const completedResources = themes.reduce((acc, theme) =>
        acc + theme.resources.filter(r => r.completed).length, 0
    );

    const completionRate = totalResources > 0
        ? Math.round((completedResources / totalResources) * 100)
        : 0;

    // Calculate total learning days (sum of all theme durations)
    const totalDays = themes.reduce((acc, theme) => {
        const start = new Date(theme.startDate);
        const end = new Date(theme.endDate);
        const diff = end.getTime() - start.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
    }, 0);

    const stats = [
        {
            label: 'Total Themes',
            value: totalThemes,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            )
        },
        {
            label: 'Resources Done',
            value: completedResources,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )
        },
        {
            label: 'Completion Rate',
            value: `${completionRate}%`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            )
        },
        {
            label: 'Days Planned',
            value: totalDays,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
    ];

    return (
        <div className={styles.container}>
            {stats.map((stat, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.icon}>{stat.icon}</div>
                    <div className={styles.content}>
                        <div className={styles.value}>{stat.value}</div>
                        <div className={styles.label}>{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};
