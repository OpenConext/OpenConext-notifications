# OpenConext-notifications

Internal app for creating notifications for other applications.

Maven multi-module project:

- `server` - Spring Boot server (OIDC secured CRUD API, basic authentication server-to-server API)
- `client` - React / TypeScript GUI, packaged into the server

## Database

The server uses MariaDB on localhost, the schema is managed by Flyway (`server/src/main/resources/db/migration`).
Create the database and user:

```sql
DROP DATABASE IF EXISTS notifications;
CREATE DATABASE notifications CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'notifications'@'%' IDENTIFIED BY 'secret';
GRANT ALL privileges ON `notifications`.* TO 'notifications'@'%';
FLUSH PRIVILEGES;
```

## Run

```bash
mvn -pl server spring-boot:run -Dspring-boot.run.profiles=local   # fake login, server on :8082
cd client && yarn dev                                              # GUI on :3004, proxies to the server
```

## Tests

```bash
mvn -pl server test       # H2 in MariaDB mode
mvn install -Pe2e         # also starts the server (local profile) and runs the Playwright e2e tests
cd client && yarn e2e     # the e2e tests alone, needs the server running with the local profile
```

The e2e tests use the MariaDB above and a Playwright browser: `cd client && yarn playwright install chromium`.

## Docker

Two images: `client` (Apache with the built GUI, proxying the API, `/config`, `/oauth2`, `/login` and `/logout` to the
server) and `server`. To run them locally with MariaDB:

```bash
mvn clean install
docker compose up --build
```

The application is then available on http://localhost:8080 (fake login, `local` profile).
