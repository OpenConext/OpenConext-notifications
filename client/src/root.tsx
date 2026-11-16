import { useEffect, useState } from 'react';
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
} from 'react-router';

import { Spinner, Toaster } from '@surfnet/curve-react';
import '@surfnet/curve-react/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LOGIN_URL } from './api/apiFetch';
import './index.scss';
import I18n from './locale/I18n';
import { useConfigStore } from './store/config';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang={I18n.locale}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
                <title>{I18n.t('globalVariables.productName')}</title>
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function HydrateFallback() {
    return (
        <div className="centered" data-testid="loading">
            <Spinner />
        </div>
    );
}

export default function Root() {
    const [queryClient] = useState(() => new QueryClient());
    const config = useConfigStore((state) => state.config);
    const { pathname } = useLocation();
    const loggedOutPage = pathname === '/logged-out';

    useEffect(() => {
        if (!loggedOutPage) {
            void useConfigStore.getState().loadConfig();
        }
    }, [loggedOutPage]);

    // there is no landing page: unauthenticated users go straight to the OIDC provider
    useEffect(() => {
        if (!loggedOutPage && config && !config.authenticated) {
            window.location.href = LOGIN_URL;
        }
    }, [config, loggedOutPage]);

    const ready = loggedOutPage || (config !== null && config.authenticated);

    return (
        <QueryClientProvider client={queryClient}>
            {ready ? <Outlet /> : <HydrateFallback />}
            <Toaster position="bottom-right" />
        </QueryClientProvider>
    );
}
