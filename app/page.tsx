'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { ThemeList } from '@/components/ThemeList';
import { FocusWidget } from '@/components/FocusWidget';
import { useThemeData, THEME_COLORS } from '@/hooks/useThemeData';
import { Auth } from '@/components/Auth';
import { useAuth } from '@/context/AuthContext';
import { Database, LogOut, Settings } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { user, signOut } = useAuth();
  const { themes, createTheme, deleteTheme, storageMode, isLoading: isLoadingThemes } = useThemeData();

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim() || !startDate || !endDate) return;

    setIsLoadingSubmit(true);

    // Determine color based on sequence
    const nextColorIndex = themes.length % THEME_COLORS.length;
    const nextColor = THEME_COLORS[nextColorIndex];

    try {
      // Save theme data (Use sequential color)
      const newTheme = await createTheme(theme, goal, formatDate(startDate), formatDate(endDate), nextColor);

      // Navigate to theme dashboard with ID
      router.push(`/dashboard?id=${newTheme.id}`);
    } catch (error) {
      console.error('Failed to create theme:', error);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // Find active theme for FocusWidget
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeTheme = themes.find(t => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return today >= start && today <= end;
  });

  if (storageMode === 'supabase' && !user) {
    return <Auth />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.topHeader}>
        {user && (
          <div className={styles.userProfile}>
            <span className={styles.userEmail}>{user.email}</span>
            <button onClick={() => signOut()} className={styles.signOutBtn} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>


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
            <Textarea
              placeholder="Why are you starting this? What is your final goal?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              label="Learning Goal / Why Focus on This?"
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

            <Button type="submit" size="lg" isLoading={isLoadingSubmit} disabled={!theme.trim() || !startDate || !endDate}>
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
    </div >
  );
}
