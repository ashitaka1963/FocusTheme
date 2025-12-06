import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = false,
}) => {
    return (
        <div
            className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`}
        >
            {children}
        </div>
    );
};
