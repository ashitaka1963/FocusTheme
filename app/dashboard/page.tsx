'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { ResourceList } from '@/components/ResourceList';
import { Notes } from '@/components/Notes';
import { ProgressBar } from '@/components/ProgressBar';
import { QuickStats } from '@/components/QuickStats';
import { LearningLog } from '@/components/LearningLog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { useThemeData } from '@/hooks/useThemeData';
import { useAuth } from '@/context/AuthContext';
import { Auth } from '@/components/Auth';

function DashboardContent() {
    const searchParams = useSearchParams();
    const themeId = searchParams.get('id');
    const {
        theme,
        isLoading,
        storageMode,
        addResource,
        removeResource,
        toggleResourceCompletion,
        updateNotes,
        updateThemeGoal,
        updateThemeDates
    } = useThemeData(themeId || undefined);

    const { user, isLoading: isAuthLoading } = useAuth();

    if (storageMode === 'supabase' && isAuthLoading) {
        return <div className={styles.page}>Loading session...</div>;
    }

    if (storageMode === 'supabase' && !user) {
        return <Auth />;
    }

    const [isEditingDates, setIsEditingDates] = useState(false);
    const [editStartDate, setEditStartDate] = useState<Date | null>(null);
    const [editEndDate, setEditEndDate] = useState<Date | null>(null);

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [editGoal, setEditGoal] = useState('');

    useEffect(() => {
        if (theme) {
            setEditStartDate(new Date(theme.startDate));
            setEditEndDate(new Date(theme.endDate));
            setEditGoal(theme.goal || '');
        }
    }, [theme]);

    if (isLoading) return <div className={styles.page}>Loading...</div>;

    if (!theme) {
        return (
            <div className={styles.page}>
                <main className={styles.main}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Theme not found</h1>
                        <p>The requested theme could not be found.</p>
                        <Link href="/">
                            <Button>Back to Home</Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0].replace(/-/g, '/');
    };

    const handleEditDates = () => {
        setEditStartDate(new Date(theme.startDate));
        setEditEndDate(new Date(theme.endDate));
        setIsEditingDates(true);
    };

    const handleSaveDates = () => {
        if (editStartDate && editEndDate) {
            const startStr = editStartDate.toISOString().split('T')[0];
            const endStr = editEndDate.toISOString().split('T')[0];
            updateThemeDates(theme.id, startStr, endStr);
            setIsEditingDates(false);
        }
    };

    const handleCancelEditDates = () => {
        setIsEditingDates(false);
    };

    const handleEditGoal = () => {
        setEditGoal(theme.goal || '');
        setIsEditingGoal(true);
    };

    const handleSaveGoal = () => {
        updateThemeGoal(theme.id, editGoal);
        setIsEditingGoal(false);
    };

    const handleCancelEditGoal = () => {
        setIsEditingGoal(false);
    };

    const completedCount = theme.resources.filter(r => r.completed).length;
    const totalCount = theme.resources.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <header className={styles.header}>
                    <Link href="/" className={styles.backLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Back to Home
                    </Link>

                    <div className={styles.headerCard}>
                        <div className={styles.headerTop}>
                            <h1 className={styles.title}>
                                <span className={styles.themeName}>{theme.title}</span>
                            </h1>
                            {!isEditingDates ? (
                                <div className={styles.dateRow}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={styles.calendarIcon}
                                        style={{ color: '#0ea5e9' }}
                                    >
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    <p className={styles.dates}>
                                        {theme.startDate.replace(/-/g, '/')} - {theme.endDate.replace(/-/g, '/')}
                                    </p>
                                    <button className={styles.editDateBtn} onClick={handleEditDates}>
                                        Edit
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.dateRow}>
                                    <div style={{ width: '140px' }}>
                                        <DatePicker
                                            selected={editStartDate}
                                            onChange={(date) => setEditStartDate(date)}
                                            placeholder="Start"
                                        />
                                    </div>
                                    <span className={styles.dateSeparator}>-</span>
                                    <div style={{ width: '140px' }}>
                                        <DatePicker
                                            selected={editEndDate}
                                            onChange={(date) => setEditEndDate(date)}
                                            placeholder="End"
                                            minDate={editStartDate || undefined}
                                        />
                                    </div>
                                    <Button size="sm" onClick={handleSaveDates}>Save</Button>
                                    <Button variant="ghost" size="sm" onClick={handleCancelEditDates}>Cancel</Button>
                                </div>
                            )}
                        </div>

                        {!isEditingGoal ? (
                            <div className={styles.goalSection}>
                                <div className={styles.goalLabel}>
                                    Objective
                                    <button className={styles.editGoalBtn} onClick={handleEditGoal}>Update</button>
                                </div>
                                <p className={`${styles.goalText} ${!theme.goal ? styles.placeholderGoal : ''}`}>
                                    {theme.goal || "No learning goal set for this theme."}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.goalSection}>
                                <div className={styles.goalLabel}>Edit Objective</div>
                                <Textarea
                                    value={editGoal}
                                    onChange={(e) => setEditGoal(e.target.value)}
                                    placeholder="Why are you starting this? What is your final goal?"
                                />
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                                    <Button size="sm" onClick={handleSaveGoal}>Save Objective</Button>
                                    <Button variant="ghost" size="sm" onClick={handleCancelEditGoal}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        <div className={styles.progressSection}>
                            <div className={styles.progressInfo}>
                                <span className={styles.progressPercent} style={{ color: '#0ea5e9' }}>{Math.round(progress)}%</span>
                                <span className={styles.progressLabel}>{completedCount} / {totalCount} resources completed</span>
                            </div>
                            <div className={styles.progressBarBg}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: '#0ea5e9'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    <div className={styles.mainColumn}>
                        <ResourceList
                            theme={theme}
                            addResource={addResource}
                            removeResource={removeResource}
                            toggleResourceCompletion={toggleResourceCompletion}
                        />
                    </div>

                    <div className={styles.sidebar}>
                        <QuickStats theme={theme} />
                        <LearningLog themeId={theme.id} />
                    </div>
                </div>

                <div className={styles.notesSection}>
                    <Notes theme={theme} updateNotes={updateNotes} />
                </div>
            </main>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
