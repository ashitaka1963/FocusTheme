'use client';

import React from 'react';
import styles from './StatsWidget.module.css';
import { Theme } from '@/hooks/useThemeData';
import { themeService } from '@/services/themeService';

interface StatsWidgetProps {
    themes: Theme[];
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ themes }) => {
    const [totalFocusTime, setTotalFocusTime] = React.useState<number | null>(null);

    React.useEffect(() => {
        const calculateTotalFocus = async () => {
            if (themes.length === 0) return;

            try {
                let totalMin = 0;
                // Fetch logs for all themes and sum them up
                // This handles cases where totalDuration might not have been recorded correctly
                const logPromises = themes.map(t => themeService.getSupabaseLogs(t.id).catch(() => []));
                const allLogsArray = await Promise.all(logPromises);

                allLogsArray.forEach(logs => {
                    logs.forEach((log: any) => {
                        if (log.content && log.content.startsWith('⏱️ Focus Session:')) {
                            const match = log.content.match(/(\d+) minutes/);
                            if (match) {
                                totalMin += parseInt(match[1]);
                            }
                        }
                    });
                });
                setTotalFocusTime(totalMin);
            } catch (err) {
                console.error('Failed to calculate total focus:', err);
                // Fallback to theme.totalDuration
                const fallback = themes.reduce((acc, t) => acc + (t.totalDuration || 0), 0);
                setTotalFocusTime(fallback);
            }
        };

        calculateTotalFocus();
    }, [themes]);

    if (themes.length === 0) return null;

    const totalThemes = themes.length;

    const completedResources = themes.reduce((acc, theme) =>
        acc + theme.resources.filter(r => r.completed).length, 0
    );

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
            label: 'Total Focus',
            value: totalFocusTime !== null ? `${totalFocusTime} min` : '...',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
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
