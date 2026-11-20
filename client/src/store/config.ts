import { create } from 'zustand';

import { apiFetch } from '../api/apiFetch';

// the claims of the logged in user
export type User = {
    sub: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
};

export const displayName = (user: User | null | undefined) =>
    [user?.given_name, user?.family_name].filter(Boolean).join(' ') ||
    user?.name ||
    user?.email ||
    user?.sub ||
    '';

export type Config = {
    targetApps: string[];
    authenticated: boolean;
    user: User | null;
};

type ConfigState = {
    config: Config | null;
    loadConfig: () => Promise<void>;
};

export const useConfigStore = create<ConfigState>((set) => ({
    config: null,
    loadConfig: async () => {
        set({ config: await apiFetch<Config>('/config') });
    },
}));
