# Notifications

Internal app to manage notifications for other apps. Maven multi-module: `server` (Spring Boot 4, Java 21, package `notifications`) and `client` (React 19 / TypeScript, react-router SPA, curve-react, i18n-js en/nl).

- `html_text` column holds the **markdown** source. The server-to-server API `GET /api/external/notifications?format=html|markdown` (basic auth, username = target app from `application.yml`) renders it (commonmark + OWASP sanitizer).
- CRUD API `/api/notifications` is only for the GUI and OIDC session secured (login `oidcng`); bearer tokens are not supported. No landing page: unauthenticated users are redirected to the OIDC login at once.
- Schema is owned by Flyway (`server/src/main/resources/db/migration`), Hibernate only validates. MariaDB on localhost (SQL in README).
- Ports: server 8082, client dev server 3004 (myconext's my-gui uses 3003/8081, don't clash).

## Verify
- Everything: `mvn clean install -Pe2e` (client lint + prettier + tsc + build, server tests on H2 MariaDB-mode, then e2e against the local MariaDB). Without `-Pe2e` no e2e.
- Server only: `mvn -pl server test`.
- Client only (in `client/`): `yarn check`, `yarn build`; e2e: `yarn e2e` with the server running (`mvn -pl server spring-boot:run -Dspring-boot.run.profiles=local`, fake login).
- Keep the build warning free (`build.sh` runs lint + prettier before the build).

## Gotchas
- Playwright is pinned to an exact version (now `1.65.1`), its browser is installed with `yarn playwright install chromium`; `yarn add` rewrites the pin, re-check afterwards.
- CI (`.github/workflows/actions.yml`) creates the DB user as `'notifications'@'localhost'` (not `'%'`) and avoids backticks in the shell-quoted SQL.
- Two Maven `401 .meta/prefixes.txt` warnings come from Flyway's own POM, not fixable here.
- Two Docker images (`client` Apache proxy, `server`), see `docker-compose.yml`; the server jar also embeds the client.
- Never commit or push (global rule); the user does.
