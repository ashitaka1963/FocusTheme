'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { ThemeList } from '@/components/ThemeList';
import { FocusWidget } from '@/components/FocusWidget';
import { useThemeData } from '@/hooks/useThemeData';

// Default theme colors
const THEME_COLORS = [
  '#0ea5e9', // Sky
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export default function Home() {
  const [theme, setTheme] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { themes, createTheme, deleteTheme } = useThemeData();

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim() || !startDate || !endDate) return;

    setIsLoading(true);

    // Save theme data
    const newTheme = createTheme(theme, formatDate(startDate), formatDate(endDate), selectedColor);

    // Navigate to theme dashboard with ID
    window.location.href = `/dashboard?id=${newTheme.id}`;
  };

  // Find active theme for FocusWidget
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeTheme = themes.find(t => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return today >= start && today <= end;
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Focus Theme</h1>
          <p className={styles.subtitle}>
            Deep dive into any topic. Set your theme, track your progress, and master new skills with focused learning sessions.
          </p>
        </section>

        {activeTheme && <FocusWidget theme={activeTheme} />}

        <Card className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              placeholder="What do you want to learn? (e.g., React, History)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              label="Start a new Focus Theme"
              autoFocus
              required
            />
            <div className={styles.formRow}>
              <DatePicker
                label="Start Date"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="Select start date"
              />
              <DatePicker
                label="End Date"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholder="Select end date"
                minDate={startDate || undefined}
              />
            </div>

            <div className={styles.colorSection}>
              <label className={styles.label}>Choose a Theme Color</label>
              <div className={styles.colorPalette}>
                {THEME_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.selectedColor : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" isLoading={isLoading} disabled={!theme.trim() || !startDate || !endDate}>
              Start Learning
            </Button>
          </form>
        </Card>

        <div className={styles.features}>
          <Card hoverable>
            <h3 className={styles.featureTitle}>Set Your Goal</h3>
            <p className={styles.featureText}>Define clearly what you want to learn and for how long.</p>
          </Card>
          <Card hoverable>
            <h3 className={styles.featureTitle}>Curated Resources</h3>
            <p className={styles.featureText}>Keep all your learning materials in one focused place.</p>
          </Card>
          <Card hoverable>
            <h3 className={styles.featureTitle}>Track Progress</h3>
            <p className={styles.featureText}>Visualize your journey and stay motivated.</p>
          </Card>
        </div>

        <ThemeList themes={themes} onDelete={deleteTheme} />
      </main>
    </div>
  );
}
