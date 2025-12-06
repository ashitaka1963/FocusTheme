import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    value: number; // 0 to 100
    label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
    const percentage = Math.min(100, Math.max(0, value));

    return (
        <div className={styles.container}>
            {(label || true) && (
                <div className={styles.label}>
                    <span>{label || 'Progress'}</span>
                    <span className={styles.percentage}>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={styles.barBackground}>
                <div
                    className={styles.barFill}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
