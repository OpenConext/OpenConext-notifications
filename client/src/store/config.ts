import { create } from 'zustand';

import { apiFetch } from '../api/apiFetch';

export type Config = {
    targetApps: string[];
    authenticated: boolean;
    user: string | null;
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
