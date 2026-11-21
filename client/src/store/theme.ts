import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'theme';

export const getTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return 'light';
    }
    try {
        const stored = window.localStorage.getItem(KEY);
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
    } catch {
        // storage unavailable, fall through to the system preference
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
};

export const applyTheme = (theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

const listeners = new Set<() => void>();
// remembers the choice when storage is unavailable, so the UI still follows it
let current: Theme | null = null;

export const setTheme = (theme: Theme) => {
    current = theme;
    try {
        window.localStorage.setItem(KEY, theme);
    } catch {
        // not persisted, still applied for this page view
    }
    applyTheme(theme);
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const snapshot = (): Theme => current ?? getTheme();

// the active theme: the stored choice, else the system preference; re-renders on change
export const useTheme = (): Theme =>
    useSyncExternalStore(subscribe, snapshot, () => 'light');
