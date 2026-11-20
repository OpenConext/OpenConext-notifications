import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/notifications.tsx'),
    route('new', 'routes/new.tsx'),
    route('edit/:id', 'routes/edit.tsx'),
    route('help', 'routes/help.tsx'),
    route('logged-out', 'routes/logged-out.tsx'),
    route('not-allowed', 'routes/not-allowed.tsx'),
] satisfies RouteConfig;
