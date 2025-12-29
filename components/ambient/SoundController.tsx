'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Settings, Play, Square } from 'lucide-react';
import styles from './SoundController.module.css';

export interface SoundControllerProps {
    sessionMode?: 'idle' | 'focus' | 'break' | 'starting';
}

// BGM constants
// BGM constants
const IDLE_BGM = { id: 'idle', name: 'Ambient Prep', url: '/FocusTheme/sounds/2018-10-03_-_Inspirational_Advertising_1_-_David_Fesliyan.mp3' };
const BREAK_BGM = { id: 'break', name: 'Relaxation', url: '/FocusTheme/sounds/2019-04-06_-_Deep_Meditation_-_David_Fesliyan.mp3' };

const FOCUS_MUSIC_LIST = [
    { id: 'none', name: 'No Music', url: '' },
    {
        id: 'music1',
        name: 'Inspirational Advertising',
        url: '/FocusTheme/sounds/2018-10-03_-_Inspirational_Advertising_1_-_David_Fesliyan.mp3'
    },
    {
        id: 'music2',
        name: 'Easy Going',
        url: '/FocusTheme/sounds/2020-09-30_-_Easy_Going_-_David_Fesliyan.mp3'
    },
    {
        id: 'music3',
        name: 'Deep Meditation',
        url: '/FocusTheme/sounds/2019-04-06_-_Deep_Meditation_-_David_Fesliyan.mp3'
    },
    {
        id: 'music4',
        name: 'Vibes',
        url: '/FocusTheme/sounds/2019-08-09_-_Vibes_-_www.FesliyanStudios.com_-_David_Renda.mp3'
    },
    {
        id: 'music5',
        name: 'Relaxing Green Nature',
        url: '/FocusTheme/sounds/2020-02-22_-_Relaxing_Green_Nature_-_David_Fesliyan.mp3'
    },
    {
        id: 'music6',
        name: 'Tropical Keys',
        url: '/FocusTheme/sounds/2020-09-14_-_Tropical_Keys_-_www.FesliyanStudios.com_David_Renda.mp3'
    },
    {
        id: 'music7',
        name: 'Steady Enjoyment',
        url: '/FocusTheme/sounds/2021-01-12_-_Steady_Enjoyment_-_www.FesliyanStudios.com_David_Renda.mp3'
    }
];

export const SoundController: React.FC<SoundControllerProps> = ({ sessionMode = 'idle' }) => {
    const [selectedFocusMusic, setSelectedFocusMusic] = useState<string>('music1');
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [idleEnabled, setIdleEnabled] = useState(true);
    const [breakEnabled, setBreakEnabled] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false); // Preview state

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load preferences
    useEffect(() => {
        const savedIdle = localStorage.getItem('focus_bgm_idle_enabled');
        const savedBreak = localStorage.getItem('focus_bgm_break_enabled');
        if (savedIdle !== null) setIdleEnabled(savedIdle === 'true');
        if (savedBreak !== null) setBreakEnabled(savedBreak === 'true');
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('focus_bgm_idle_enabled', idleEnabled.toString());
        localStorage.setItem('focus_bgm_break_enabled', breakEnabled.toString());
    }, [idleEnabled, breakEnabled]);

    // Reset preview when mode changes from idle
    useEffect(() => {
        if (sessionMode !== 'idle') {
            setIsPreviewing(false);
        }
    }, [sessionMode]);

    // 1. Calculate Target URL
    const [targetUrl, setTargetUrl] = useState('');

    useEffect(() => {
        let url = '';
        if (sessionMode === 'idle') {
            if (isPreviewing) {
                const music = FOCUS_MUSIC_LIST.find(m => m.id === selectedFocusMusic);
                url = music?.url || '';
            } else if (idleEnabled) {
                url = IDLE_BGM.url;
            }
        } else if (sessionMode === 'break' && breakEnabled) {
            url = BREAK_BGM.url;
        } else if (sessionMode === 'focus' || sessionMode === 'starting') {
            const music = FOCUS_MUSIC_LIST.find(m => m.id === selectedFocusMusic);
            url = music?.url || '';
        }
        setTargetUrl(url);
    }, [sessionMode, selectedFocusMusic, idleEnabled, breakEnabled, isPreviewing]);

    // 2. Handle Audio Playback (Depend ONLY on targetUrl, volume, isMuted)
    useEffect(() => {
        let isCancelled = false;

        const playMusic = async () => {
            // Stop previous audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }

            if (!targetUrl) return;

            const audio = new Audio(targetUrl);
            audio.loop = true;
            audio.volume = isMuted ? 0 : volume;
            audioRef.current = audio;

            try {
                await audio.play();
                if (isCancelled) {
                    audio.pause();
                    audio.src = "";
                }
            } catch (err: any) {
                if (!isCancelled && err.name !== 'AbortError') {
                    console.error(`BGM play failed:`, err);
                }
            }
        };

        playMusic();

        return () => {
            isCancelled = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, [targetUrl]); // Only re-run if URL changes (or implicitly if component unmounts)

    // Volume Adjustment (separate to avoid restarting audio)
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handleFocusMusicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFocusMusic(e.target.value);
    };

    const togglePreview = () => {
        setIsPreviewing(!isPreviewing);
    };

    return (
        <div className={`${styles.container} ${showAdvanced ? styles.expanded : ''}`}>
            <div className={styles.soundGrid}>
                {/* Main Selector */}
                <div className={styles.musicGroup}>
                    <div className={styles.musicLabel}>
                        <Music size={14} />
                        <span>Focus Music {sessionMode === 'idle' ? '(Select before starting)' : `(${sessionMode.toUpperCase()} mode active)`}</span>
                    </div>
                    <div className={styles.selectorWrapper}>
                        <select
                            className={styles.musicSelect}
                            onChange={handleFocusMusicChange}
                            value={selectedFocusMusic}
                            disabled={sessionMode !== 'idle'}
                        >
                            {FOCUS_MUSIC_LIST.map(music => (
                                <option key={music.id} value={music.id}>
                                    {music.name}
                                </option>
                            ))}
                        </select>

                        {/* Preview Button (Only visible in Idle) */}
                        {sessionMode === 'idle' && selectedFocusMusic !== 'none' && (
                            <button
                                className={`${styles.previewBtn} ${isPreviewing ? styles.active : ''}`}
                                onClick={togglePreview}
                                title={isPreviewing ? "Stop Preview" : "Preview Music"}
                            >
                                {isPreviewing ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>
                        )}

                        <button
                            className={`${styles.toggleBtn} ${showAdvanced ? styles.active : ''}`}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            title="BGM Settings"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Advanced Options (Toggleable) */}
                {showAdvanced && (
                    <div className={styles.advancedOptions}>
                        <div className={styles.optionItem}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={idleEnabled}
                                    onChange={(e) => setIdleEnabled(e.target.checked)}
                                />
                                <span className={styles.customCheckbox}></span>
                                <span className={styles.optionLabel}>Idle BGM</span>
                            </label>
                        </div>
                        <div className={styles.optionItem}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={breakEnabled}
                                    onChange={(e) => setBreakEnabled(e.target.checked)}
                                />
                                <span className={styles.customCheckbox}></span>
                                <span className={styles.optionLabel}>Break BGM</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.divider}></div>

            {/* Volume Control */}
            <div className={styles.volumeControl}>
                <button
                    className={styles.muteBtn}
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className={styles.slider}
                />
            </div>
        </div>
    );
};
