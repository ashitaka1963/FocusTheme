'use client';

import React from 'react';
import styles from './QuickStats.module.css';
import { Theme } from '@/hooks/useThemeData';

interface QuickStatsProps {
    theme: Theme;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ theme }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(theme.endDate);
    const startDate = new Date(theme.startDate);

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
    const completedCount = theme.resources.filter(r => r.completed).length;
    const totalCount = theme.resources.length;

    // Time progress percentage
    const timeProgress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

    // Determine status
    const isActive = remainingDays >= 0 && elapsedDays >= 0;
    const isCompleted = remainingDays < 0;
    const isUpcoming = elapsedDays < 0;

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
