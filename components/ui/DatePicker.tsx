'use client';

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DatePicker.module.css';

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    label?: string;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    selected,
    onChange,
    label,
    placeholder = 'Select date',
    minDate,
    maxDate,
}) => {
    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.pickerWrapper}>
                <ReactDatePicker
                    selected={selected}
                    onChange={onChange}
                    dateFormat="yyyy/MM/dd"
                    placeholderText={placeholder}
                    minDate={minDate}
                    maxDate={maxDate}
                    className={styles.input}
                    calendarClassName={styles.calendar}
                    wrapperClassName={styles.wrapper}
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                />
                <div className={styles.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
            </div>
        </div>
    );
};
