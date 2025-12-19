import React from 'react';
import styles from './Input.module.css'; // Reusing Input styles for consistency

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className={`${styles.container} ${className}`}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.inputWrapper}>
                    <textarea
                        ref={ref}
                        className={`${styles.input} ${error ? styles.errorInput : ''}`}
                        style={{ minHeight: '100px', resize: 'vertical' }}
                        {...props}
                    />
                </div>
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
