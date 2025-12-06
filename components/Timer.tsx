'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Timer.module.css';
import { Button } from './ui/Button';

export const Timer: React.FC = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
    };

    return (
        <div className={styles.container}>
            <span className={styles.label}>Focus Timer</span>
            <div className={styles.timeDisplay}>{formatTime(time)}</div>
            <div className={styles.controls}>
                <Button
                    variant={isRunning ? 'secondary' : 'primary'}
                    onClick={() => setIsRunning(!isRunning)}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                    Reset
                </Button>
            </div>
        </div>
    );
};
