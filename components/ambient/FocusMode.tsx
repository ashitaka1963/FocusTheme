'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Layout, BarChart, Settings as SettingsIcon, BookOpen, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { AmbientBackground } from './AmbientBackground';
import { SoundController } from './SoundController';
import styles from './FocusMode.module.css';
import { Theme } from '@/types';
import { themeService } from '@/services/themeService';

interface FocusModeProps {
    onClose: () => void;
    theme: Theme;
    storageMode?: 'local' | 'supabase' | 'localstorage';
}

type TabType = 'dashboard' | 'analytics' | 'settings' | null;

export const FocusMode: React.FC<FocusModeProps> = ({ onClose, theme, storageMode = 'local' }) => {
    const [timerDuration, setTimerDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(timerDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>(null);
    const [totalCycles, setTotalCycles] = useState(1);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [isBreak, setIsBreak] = useState(false);
    const [focusHistory, setFocusHistory] = useState<{ date: string, minutes: number }[]>([]);
    const [currentTotalDuration, setCurrentTotalDuration] = useState(theme.totalDuration || 0);
    const [isStarting, setIsStarting] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Fetch focus history for analytics
    const loadFocusHistory = useCallback(async () => {
        try {
            let logs: any[] = [];
            if (storageMode === 'supabase') {
                logs = await themeService.getSupabaseLogs(theme.id);
            } else {
                logs = themeService.getLocalLogs(theme.id);
            }
            const history = logs
                .filter(log => log.content.startsWith('⏱️ Focus Session:'))
                .map(log => {
                    const match = log.content.match(/(\d+) minutes/);
                    return {
                        date: log.date, // Format from DB: YYYY/MM/DD (UTC based in DB)
                        minutes: match ? parseInt(match[1]) : 0
                    };
                });
            setFocusHistory(history);
        } catch (err) {
            console.error('Failed to load focus history:', err);
        }
    }, [theme.id, storageMode]);

    const getLocalDateStr = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    useEffect(() => {
        if (activeTab === 'analytics') {
            loadFocusHistory();
        }
    }, [activeTab, loadFocusHistory]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            if (!isBreak) {
                // Focus ended - Automatic Logging
                logSession(timerDuration);

                if (currentCycle < totalCycles) {
                    setIsBreak(true);
                    setTimeLeft(breakDuration * 60);
                } else {
                    setIsActive(false);
                    // Session complete
                }
            } else {
                // Break ended
                setIsBreak(false);
                setCurrentCycle((prev) => prev + 1);
                setTimeLeft(timerDuration * 60);
            }
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft, isBreak, currentCycle, totalCycles, timerDuration, breakDuration, theme.id, loadFocusHistory]);

    // Gateway Countdown Effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isStarting && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (isStarting && countdown === 0) {
            setIsStarting(false);
            setIsActive(true);
            setCountdown(5);
            setActiveTab(null); // Close any open panels
        }
        return () => clearInterval(timer);
    }, [isStarting, countdown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const logSession = useCallback(async (minutes: number) => {
        if (minutes < 1) return;
        try {
            // Update Duration
            const newTotal = currentTotalDuration + minutes;
            setCurrentTotalDuration(newTotal);

            const today = new Date();
            const dateStrLog = today.toISOString().split('T')[0]; // YYYY-MM-DD

            if (storageMode === 'supabase') {
                await themeService.createSupabaseLog(theme.id, `⏱️ Focus Session: ${minutes} minutes`, dateStrLog);
                await themeService.updateSupabaseTheme(theme.id, { totalDuration: newTotal });
            } else {
                // Local Storage Logging
                const dateStrLocal = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
                const entry = {
                    id: Date.now().toString(),
                    date: dateStrLocal,
                    content: `⏱️ Focus Session: ${minutes} minutes`,
                };
                const existingLogs = themeService.getLocalLogs(theme.id);
                themeService.saveLocalLogs(theme.id, [entry, ...existingLogs]);

                // Update Theme Duration in Local Storage
                const stored = localStorage.getItem('focus_theme_data');
                if (stored) {
                    const themes = JSON.parse(stored);
                    const updatedThemes = themes.map((t: any) =>
                        t.id === theme.id ? { ...t, totalDuration: newTotal } : t
                    );
                    localStorage.setItem('focus_theme_data', JSON.stringify(updatedThemes));
                }
            }
            loadFocusHistory();
        } catch (err) {
            console.error('Failed to log session:', err);
        }
    }, [theme.id, theme.totalDuration, storageMode, currentTotalDuration, loadFocusHistory]);

    const toggleTimer = () => {
        if (!isActive && isIdle) {
            setIsStarting(true);
            setCountdown(5);
        } else {
            setIsActive(!isActive);
        }
    };

    const handleQuit = async () => {
        if (!isBreak) {
            const elapsedSeconds = (timerDuration * 60) - timeLeft;
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            if (elapsedMinutes >= 1) {
                await logSession(elapsedMinutes);
            }
        }
        onClose();
    };

    const handleTabClick = (tab: TabType) => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    const updateTimerDuration = (mins: number) => {
        setTimerDuration(mins);
        if (!isBreak) setTimeLeft(mins * 60);
        setIsActive(false);
    };

    const updateBreakDuration = (mins: number) => {
        setBreakDuration(mins);
        if (isBreak) setTimeLeft(mins * 60);
        setIsActive(false);
    };

    const updateCycles = (count: number) => {
        setTotalCycles(count);
        setCurrentCycle(1);
        setIsBreak(false);
        setTimeLeft(timerDuration * 60);
        setIsActive(false);
    };

    const completedResources = theme.resources?.filter(r => r.completed) || [];
    const progress = theme.resources?.length ? (completedResources.length / theme.resources.length) * 100 : 0;

    const currentTargetDuration = isBreak ? breakDuration : timerDuration;
    const isIdle = timeLeft === currentTargetDuration * 60 && !isActive;
    const isPaused = !isActive && !isIdle;

    const getStatusClass = () => {
        const classes = [];
        if (isBreak) classes.push(styles.onBreak);
        if (isActive) classes.push(styles.focusing);
        if (isPaused) classes.push(styles.paused);
        if (isIdle) classes.push(styles.idle);
        if (isActive && !isBreak) classes.push(styles.deepFocus);
        if (isStarting) classes.push(styles.starting);
        return classes.join(' ');
    };

    return (
        <div className={`${styles.container} ${getStatusClass()} ${isBreak ? styles.breakMode : ''}`}>
            <AmbientBackground deepFocus={isActive && !isBreak} />

            {isStarting && (
                <div className={styles.gatewayOverlay}>
                    <div className={styles.countdownBox}>
                        <div className={styles.countdownNumber}>{countdown}</div>
                        <div className={styles.countdownLabel}>PREPARING TO FOCUS</div>
                        <div className={styles.countdownGoal}>{theme.goal}</div>
                    </div>
                </div>
            )}

            <header className={styles.header}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}></div>
                    <span>FOCUS FLOW</span>
                </div>
                <nav className={styles.nav}>
                    <span
                        className={activeTab === 'dashboard' ? styles.activeNav : ''}
                        onClick={() => handleTabClick('dashboard')}
                    >
                        Dashboard
                    </span>
                    <span
                        className={activeTab === 'analytics' ? styles.activeNav : ''}
                        onClick={() => handleTabClick('analytics')}
                    >
                        Analytics
                    </span>
                    <span
                        className={activeTab === 'settings' ? styles.activeNav : ''}
                        onClick={() => handleTabClick('settings')}
                    >
                        Settings
                    </span>
                </nav>
                <div className={styles.controls}>
                    <button onClick={handleQuit} className={styles.iconBtn} title="Quit Focus Mode">
                        <X size={24} />
                    </button>
                </div>
            </header>

            <main className={styles.main}>
                {/* Main Timer Display */}
                <div className={`${styles.timerWrapper} ${activeTab ? styles.timerShifted : ''}`}>
                    <div className={styles.timerCircle}>
                        <div className={styles.timerContent}>
                            <div className={styles.sessionType}>
                                {isBreak ? 'BREAK TIME' : 'FOCUS TIME'}
                            </div>
                            <div className={styles.time}>{formatTime(timeLeft)}</div>
                            <div className={styles.cycleIndicator}>
                                Cycle {currentCycle} / {totalCycles}
                            </div>
                            <div className={styles.themeName}>{theme.title}</div>
                            <div className={styles.mainActions}>
                                <button className={styles.startBtn} onClick={toggleTimer}>
                                    {isActive ? 'PAUSE' : isPaused ? 'RESUME' : 'START FOCUS'}
                                </button>
                                {isPaused && (
                                    <button
                                        className={styles.resetBtn}
                                        onClick={() => {
                                            setIsActive(false);
                                            setTimeLeft(currentTargetDuration * 60);
                                        }}
                                    >
                                        RESET
                                    </button>
                                )}
                            </div>
                        </div>
                        <svg className={styles.progressRing} width="400" height="400">
                            <circle
                                className={styles.progressRingCircle}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeWidth="6"
                                fill="transparent"
                                r="185"
                                cx="200"
                                cy="200"
                            />
                            <circle
                                className={styles.progressRingFull}
                                stroke={isBreak ? 'var(--color-secondary)' : 'var(--color-primary)'}
                                strokeWidth="6"
                                strokeDasharray={185 * 2 * Math.PI}
                                strokeDashoffset={185 * 2 * Math.PI * (1 - timeLeft / (currentTargetDuration * 60))}
                                strokeLinecap="round"
                                fill="transparent"
                                r="185"
                                cx="200"
                                cy="200"
                                style={{
                                    filter: `drop-shadow(0 0 8px ${isBreak ? 'var(--color-secondary)' : 'var(--color-primary)'})`,
                                    transition: 'stroke-dashoffset 1s linear'
                                }}
                            />
                        </svg>
                    </div>
                </div>

                {/* Overlay Panels */}
                {activeTab === 'dashboard' && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <Layout size={20} />
                            <h3>Information</h3>
                        </div>
                        <div className={styles.panelContent}>
                            <section className={styles.panelSection}>
                                <label><BookOpen size={14} /> Current Objective</label>
                                <p className={styles.objectiveText}>{theme.goal || "No goal set."}</p>
                            </section>
                            <section className={styles.panelSection}>
                                <label><CheckCircle size={14} /> Resources ({completedResources.length}/{theme.resources?.length})</label>
                                <div className={styles.resourceBriefList}>
                                    {theme.resources?.map(resource => (
                                        <div key={resource.id} className={`${styles.resourceBriefItem} ${resource.completed ? styles.completed : ''}`}>
                                            <span className={styles.dot} />
                                            <span className={styles.resourceTitle}>{resource.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {theme.notes && (
                                <section className={styles.panelSection}>
                                    <label>Notes</label>
                                    <div className={styles.notesPreview}>{theme.notes}</div>
                                </section>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <TrendingUp size={20} />
                            <h3>Analytics</h3>
                        </div>
                        <div className={styles.panelContent}>
                            <div className={styles.statsGrid}>
                                <div className={styles.miniStatCard}>
                                    <span className={styles.statLabel}>Today Total</span>
                                    <span className={styles.statValue}>
                                        {(() => {
                                            const today = getLocalDateStr(new Date());
                                            const total = focusHistory
                                                .filter(h => h.date === today)
                                                .reduce((acc, curr) => acc + curr.minutes, 0);
                                            return total;
                                        })()}
                                        <small style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.5 }}>min</small>
                                    </span>
                                </div>
                                <div className={styles.miniStatCard}>
                                    <span className={styles.statLabel}>Theme Progress</span>
                                    <span className={styles.statValue}>{Math.round(progress)}%</span>
                                </div>
                            </div>

                            <div className={styles.analyticsSection}>
                                <label><BarChart size={14} /> 7-Day Trend</label>
                                <div className={styles.barChart}>
                                    {(() => {
                                        const days = [...Array(7)].map((_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (6 - i));
                                            const dateStr = getLocalDateStr(d);
                                            const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
                                            const total = focusHistory
                                                .filter(h => h.date === dateStr)
                                                .reduce((acc, curr) => acc + curr.minutes, 0);
                                            return { dayName, total, dateStr };
                                        });

                                        const maxTotal = Math.max(...days.map(d => d.total), 45); // Set min-max to 45 for better scale

                                        return days.map((day, i) => {
                                            const height = (day.total / maxTotal) * 100;
                                            return (
                                                <div key={i} className={styles.barWrapper}>
                                                    <div className={styles.barContainer}>
                                                        <div
                                                            className={styles.bar}
                                                            style={{
                                                                height: day.total > 0 ? `${Math.max(height, 8)}%` : '2px', // Min 8% height for visibility
                                                                opacity: day.total > 0 ? 1 : 0.2
                                                            }}
                                                            title={`${day.dateStr}: ${day.total} min`}
                                                        />
                                                    </div>
                                                    <span className={styles.barLabel}>{day.dayName}</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            <div className={styles.infoBox} style={{ marginTop: '32px' }}>
                                <Clock size={16} />
                                <p>Sessions are automatically recorded to your learning log upon completion.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <SettingsIcon size={20} />
                            <h3>Session Settings</h3>
                        </div>
                        <div className={styles.panelContent}>
                            <section className={styles.panelSection}>
                                <label>Repeat Rounds (Cycles)</label>
                                <div className={styles.cycleControls}>
                                    {[1, 2, 3, 4, 5].map(count => (
                                        <button
                                            key={count}
                                            className={`${styles.cycleBtn} ${totalCycles === count ? styles.active : ''}`}
                                            onClick={() => updateCycles(count)}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </section>
                            <section className={styles.panelSection}>
                                <label>Focus Duration (Minutes)</label>
                                <div className={styles.durationButtons}>
                                    {[15, 25, 45, 60].map(mins => (
                                        <button
                                            key={mins}
                                            className={`${styles.durationBtn} ${timerDuration === mins ? styles.active : ''}`}
                                            onClick={() => updateTimerDuration(mins)}
                                        >
                                            {mins}
                                        </button>
                                    ))}
                                </div>
                            </section>
                            <section className={styles.panelSection}>
                                <label>Break Duration (Minutes)</label>
                                <div className={styles.durationButtons}>
                                    {[3, 5, 10, 15].map(mins => (
                                        <button
                                            key={mins}
                                            className={`${styles.durationBtn} ${breakDuration === mins ? styles.active : ''}`}
                                            onClick={() => updateBreakDuration(mins)}
                                        >
                                            {mins}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </main>

            <footer className={styles.footer}>
                <SoundController
                    sessionMode={isStarting ? 'starting' : (isBreak ? 'break' : (isActive ? 'focus' : 'idle'))}
                />
            </footer>
        </div>
    );
};
