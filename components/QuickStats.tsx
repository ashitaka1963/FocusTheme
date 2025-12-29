'use client';

import React from 'react';
import styles from './QuickStats.module.css';
import { Theme } from '@/hooks/useThemeData';
import { themeService } from '@/services/themeService';

interface QuickStatsProps {
    theme: Theme;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ theme }) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [calculatedDuration, setCalculatedDuration] = React.useState<number | null>(null);

    React.useEffect(() => {
        setIsMounted(true);

        const fetchDurationFromLogs = async () => {
            try {
                // Try to get actual duration from logs to be more accurate
                const logs = await themeService.getSupabaseLogs(theme.id).catch(() => []);
                let totalMin = 0;
                logs.forEach((log: any) => {
                    if (log.content && log.content.startsWith('⏱️ Focus Session:')) {
                        const match = log.content.match(/(\d+) minutes/);
                        if (match) totalMin += parseInt(match[1]);
                    }
                });
                setCalculatedDuration(totalMin);
            } catch (err) {
                console.error('Failed to fetch logs for duration:', err);
            }
        };

        fetchDurationFromLogs();
    }, [theme.id]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(theme.endDate || Date.now());
    const startDate = new Date(theme.startDate || Date.now());

    // Calculate remaining days
    const diffTime = endDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate total days
    const totalTime = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));

    // Calculate elapsed days
    const elapsedTime = today.getTime() - startDate.getTime();
    const elapsedDays = Math.max(0, Math.ceil(elapsedTime / (1000 * 60 * 60 * 24)));

    // Resource stats
    const resources = theme.resources || [];
    const completedCount = resources.filter(r => r.completed).length;
    const totalCount = resources.length;

    // Time progress percentage
    const timeProgress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

    // Determine status
    const isActive = remainingDays >= 0 && elapsedDays >= 0;
    const isCompleted = remainingDays < 0;
    const isUpcoming = elapsedDays < 0;

    const displayDuration = calculatedDuration !== null ? calculatedDuration : (theme.totalDuration || 0);

    if (!isMounted) return <div className={styles.container} style={{ height: '200px', opacity: 0 }} />;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Quick Stats</h3>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>
                        {isUpcoming ? 'Starting soon' : isCompleted ? 'Completed' : `${remainingDays}`}
                    </div>
                    <div className={styles.statLabel}>
                        {isActive ? 'days left' : ''}
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.statItem}>
                    <div className={styles.statValue}>{displayDuration}<small style={{ fontSize: '12px', marginLeft: '2px', opacity: 0.7 }}>min</small></div>
                    <div className={styles.statLabel}>total focus</div>
                </div>

                <div className={styles.divider} />

                <div className={styles.statItem}>
                    <div className={styles.statValue}>{completedCount}/{totalCount}</div>
                    <div className={styles.statLabel}>resources done</div>
                </div>
            </div>

            {isActive && (
                <div className={styles.timeProgress}>
                    <div className={styles.timeLabel}>
                        <span>Day {elapsedDays + 1}</span>
                        <span>of {totalDays}</span>
                    </div>
                    <div className={styles.timeBar}>
                        <div
                            className={styles.timeFill}
                            style={{ width: `${timeProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
