'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Timeline.module.css';
import { Button } from './ui/Button';
import { Theme } from '@/hooks/useThemeData';

interface TimelineProps {
    themes: Theme[];
}

// Helper to convert hex to rgb
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const Timeline: React.FC<TimelineProps> = ({ themes }) => {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());

    if (themes.length === 0) return null;

    // Get current month's first and last day
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Filter themes that overlap with current month
    const relevantThemes = themes.filter(theme => {
        const themeStart = new Date(theme.startDate);
        const themeEnd = new Date(theme.endDate);
        return themeEnd >= firstDay && themeStart <= lastDay;
    });

    // Packing algorithm to handle overlaps
    const sortedThemes = [...relevantThemes].sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const lanes: Theme[][] = [];
    const themeLanes = new Map<string, number>();

    sortedThemes.forEach(theme => {
        const themeStart = new Date(theme.startDate);
        const themeEnd = new Date(theme.endDate);

        // Find first lane where this theme fits
        let laneIndex = 0;
        while (true) {
            const lane = lanes[laneIndex] || [];
            const hasOverlap = lane.some(existingTheme => {
                const existingStart = new Date(existingTheme.startDate);
                const existingEnd = new Date(existingTheme.endDate);
                return themeStart <= existingEnd && themeEnd >= existingStart;
            });

            if (!hasOverlap) {
                if (!lanes[laneIndex]) lanes[laneIndex] = [];
                lanes[laneIndex].push(theme);
                themeLanes.set(theme.id, laneIndex);
                break;
            }
            laneIndex++;
        }
    });

    const totalLanes = lanes.length;
    const laneHeight = 32;
    const laneGap = 8;
    const containerHeight = Math.max(60, totalLanes * (laneHeight + laneGap));

    // Calculate position percentage for a given date
    const getPositionPercent = (date: Date) => {
        const day = date.getDate();
        return ((day - 1) / daysInMonth) * 100;
    };

    // Get today's position
    const today = new Date();
    const todayPosition = today.getMonth() === currentMonth && today.getFullYear() === currentYear
        ? getPositionPercent(today)
        : null;

    // Generate date labels (show every 5 days)
    const dateLabels: number[] = [];
    for (let i = 1; i <= daysInMonth; i += 5) {
        dateLabels.push(i);
    }
    if (!dateLabels.includes(daysInMonth)) {
        dateLabels.push(daysInMonth);
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.navContainer}>
                    <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </Button>
                    <h2 className={styles.title}>
                        {firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </Button>
                </div>
            </div>

            <div className={styles.timeline}>
                <div className={styles.dateHeader}>
                    <div className={styles.dateLabels}>
                        {dateLabels.map(day => (
                            <div key={day} className={styles.dateLabel} style={{ position: 'absolute', left: `${getPositionPercent(new Date(currentYear, currentMonth, day))}%` }}>
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.singleRow} style={{ height: `${containerHeight}px` }}>
                    <div className={styles.barContainer}>
                        {sortedThemes.map((theme) => {
                            const themeStart = new Date(theme.startDate);
                            const themeEnd = new Date(theme.endDate);

                            // Clamp to current month
                            const displayStart = themeStart < firstDay ? firstDay : themeStart;
                            const displayEnd = themeEnd > lastDay ? lastDay : themeEnd;

                            const leftPercent = getPositionPercent(displayStart);
                            const rightPercent = getPositionPercent(displayEnd);
                            const widthPercent = Math.max(1, rightPercent - leftPercent + (100 / daysInMonth));

                            const laneIndex = themeLanes.get(theme.id) || 0;
                            const top = laneIndex * (laneHeight + laneGap);

                            const colorHex = theme.color || '#0ea5e9';
                            const rgb = hexToRgb(colorHex) || { r: 14, g: 165, b: 233 };
                            const baseColor = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

                            return (
                                <div
                                    key={theme.id}
                                    className={styles.bar}
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        top: `${top}px`,
                                        height: `${laneHeight}px`,
                                        backgroundColor: `rgba(${baseColor}, 0.25)`,
                                        border: `1px solid rgba(${baseColor}, 0.6)`,
                                        boxShadow: `0 0 12px rgba(${baseColor}, 0.15), inset 0 0 20px rgba(${baseColor}, 0.05)`,
                                        backdropFilter: 'blur(4px)',
                                        color: '#fff', // Ensure text is white
                                        zIndex: 10
                                    }}
                                    title={`${theme.title} (${theme.startDate} - ${theme.endDate})`}
                                    onClick={() => router.push(`/dashboard?id=${theme.id}`)}
                                >
                                    <span className={styles.barLabel} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                        {theme.title}
                                    </span>
                                </div>
                            );
                        })}

                        {todayPosition !== null && (
                            <div className={styles.todayLine} style={{ left: `${todayPosition}%` }}>
                                <div className={styles.todayMarker}>Today</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
