import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className={`${styles.container} ${className}`}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.inputWrapper}>
                    <input
                        ref={ref}
                        className={`${styles.input} ${error ? styles.errorInput : ''}`}
                        {...props}
                    />
                </div>
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
