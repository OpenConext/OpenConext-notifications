import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Plugin, defineConfig } from 'vite';

import { reactRouter } from '@react-router/dev/vite';

// The prerender of the SPA fallback starts a second vite instance whose file
// watchers keep the process alive, which stalls mvn install
const exitAfterBuild = (): Plugin => ({
    name: 'exit-after-build',
    enforce: 'post',
    apply: 'build',
    buildApp: {
        order: 'post',
        handler() {
            // Exit only once the prerender (which runs concurrently with this hook) has written the
            // index.html; exiting at once aborts its request
            const indexHtml = resolve('build/client/index.html');
            const timer = setInterval(() => {
                if (existsSync(indexHtml)) {
                    clearInterval(timer);
                    process.exit(0);
                }
            }, 200);
            return Promise.resolve();
        },
    },
});

// Chrome DevTools probes this path on the dev server; without an answer react-router logs a
// "No route matches" 404 error in the console. Answer it before the router sees it.
const ignoreDevtoolsProbe = (): Plugin => ({
    name: 'ignore-devtools-probe',
    apply: 'serve',
    configureServer(devServer) {
        devServer.middlewares.use(
            '/.well-known/appspecific/com.chrome.devtools.json',
            (_req, res) => {
                res.statusCode = 404;
                res.end();
            },
        );
    },
});

const server = {
    target: 'http://localhost:8082',
    changeOrigin: false,
    secure: false,
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [ignoreDevtoolsProbe(), reactRouter(), exitAfterBuild()],
    build: {
        // the markdown editor (lazy loaded) is about 1.1MB
        chunkSizeWarningLimit: 1200,
        cssMinify: 'esbuild',
    },
    resolve: {
        tsconfigPaths: true,
    },
    preview: {
        host: '127.0.0.1',
    },
    server: {
        port: 3004,
        open: true,
        proxy: {
            '/config': server,
            '/api': server,
            '/oauth2': server,
            '/login/oauth2': server,
            '/logout': server,
        },
    },
});
