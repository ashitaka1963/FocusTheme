'use client';

import React from 'react';
import Link from 'next/link';
import styles from './FocusWidget.module.css';
import { Button } from './ui/Button';
import { ProgressBar } from './ProgressBar';
import { Theme } from '@/hooks/useThemeData';
import { Timer, ArrowRight } from 'lucide-react';

interface FocusWidgetProps {
    theme: Theme;
}

export const FocusWidget: React.FC<FocusWidgetProps> = ({ theme }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(theme.startDate);
    const endDate = new Date(theme.endDate);

    // Calculate days elapsed
    const diffTime = today.getTime() - startDate.getTime();
    const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start date

    // Calculate total duration
    const totalDurationTime = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(totalDurationTime / (1000 * 60 * 60 * 24)) + 1;

    // Progress
    const completedCount = theme.resources.filter(r => r.completed).length;
    const totalCount = theme.resources.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.label}>Current Focus</span>
                    <h2 className={styles.title}>{theme.title}</h2>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>Day {Math.max(1, daysElapsed)}</span>
                        <span className={styles.statLabel}>of {totalDays} days</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{completedCount}</span>
                        <span className={styles.statLabel}>resources done</span>
                    </div>
                </div>

                <div className={styles.progressContainer}>
                    <ProgressBar value={progress} label="" />
                </div>
            </div>

            <div className={styles.action}>
                <Link href={`/focus?id=${theme.id}`}>
                    <Button size="lg" className={`${styles.button} ${styles.timerButton}`}>
                        <Timer size={20} style={{ marginRight: '8px' }} />
                        Start Timer
                    </Button>
                </Link>
                <Link href={`/dashboard?id=${theme.id}`}>
                    <Button variant="ghost" className={`${styles.button} ${styles.dashboardButton}`}>
                        Dashboard
                        <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </Button>
                </Link>
            </div>
        </div>
    );
};
