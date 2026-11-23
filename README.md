# OpenConext-notifications

Internal app for creating notifications for other applications.

Maven multi-module project:

- `server` - Spring Boot server (OIDC session secured CRUD API for the GUI, basic authentication server-to-server API)
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

## API

The API for other applications is the server-to-server API below. The examples use the server on http://localhost:8082.

### Server-to-server API (target apps)

Used by the applications the notifications are for. It uses HTTP Basic authentication: the username is the target app
and the password is the one configured for that app in `notifications.target-apps` of `application.yml` (`myconext` and
`servicedesk`, both with password `secret` by default). An application only gets its own notifications, and only the
ones that are active now (`startAt` <= now < `endsAt`), newest first.

```bash
# the text rendered (and sanitized) as HTML, this is the default
curl -u myconext:secret "http://localhost:8082/api/external/notifications"

# the markdown source
curl -u myconext:secret "http://localhost:8082/api/external/notifications?format=markdown"
```

Response:

```json
[
  {
    "id": 8,
    "startAt": "2026-11-19T23:00:00Z",
    "endsAt": "2026-11-27T22:59:59Z",
    "creator": "jane.doe@example.com",
    "text": "<p>Planned <strong>maintenance</strong> tonight</p>\n",
    "format": "html"
  }
]
```

A wrong username or password returns `401`.

### CRUD API (GUI only)

`/api/notifications` is only meant for the GUI. It is secured with the OIDC session login (and CSRF protection),
bearer tokens are not supported and a request without a session returns `401`. The only API for other applications is
the server-to-server API above.

#### Who may log in

Feature toggle `notifications.allow-any-user` in `application.yml` (default `true`, also when the property is missing
in an environment):

- `true`: anybody that authenticates at the OIDC provider may log in, `notifications.required-member-of` is ignored.
- `false`: only users whose `edumember_is_member_of` claim contains `notifications.required-member-of` may log in.
  Others are sent to the GUI page `/not-allowed` and get `401` on the API. A blank `required-member-of` means no
  restriction.

Notifications that ended more than 5 days ago are removed by the `ResourceCleaner` (`notifications.cron`). It runs every
hour and uses ShedLock (table `shedlock`), so only one node runs it at a time. The schedule, the locks and the number of
days are configured in the `cron` section of `application.yml`.

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

The application is then available on http://localhost:8080 (fake login, `local` profile). Or not.
