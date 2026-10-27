# Phase 4: running local environment

Verified on 27 October 2026 (Europe/Kyiv). This environment uses the actual
existing backend and Docker volumes, with no Playwright interception in the
manually accessible frontend. Fixture QA is documented separately in
[Phase 4](phase-4.md).

| Entry | Address |
| --- | --- |
| Frontend | http://localhost:5176/ (also http://127.0.0.1:5176/) |
| API base | http://localhost:5211/api |
| Swagger | http://localhost:5211/swagger/index.html |
| OpenAPI | http://localhost:5211/swagger/v1/swagger.json |
| Loyalty | HTTP listener `127.0.0.1:3000`, gRPC `127.0.0.1:50051` |

The loyalty service has no root HTTP health endpoint; its readiness was verified
by TCP, successful gRPC reads and startup/database/broker logs.

## Infrastructure

Started only `cinema-db`, `cinema-redis`, `cinema-rabbitmq` and `loyalty-db` from
`cinema-platform-back/docker-compose.yaml`. The seeder service was excluded.

| Container | Port | Verification |
| --- | --- | --- |
| `cinema-postgres` | 5432 | Running, Docker healthy, `pg_isready` accepts connections. |
| `cinema-redis` | 6379 | Running, TCP reachable; API's real Redis-backed reads succeed. |
| `cinema-rabbitmq` | 5672 / 15672 | Running, `rabbitmq-diagnostics -q ping` succeeds; both application transports connect. |
| `cinema_loyalty_db` | 5433 | Running, `pg_isready` accepts connections; authenticated gRPC database read succeeds. |

Only Cinema PostgreSQL has a configured Docker healthcheck. The others are
running and checked explicitly; no Docker “healthy” status is invented for them.
Existing `cinema-platform-back_postgres_data`, `_redis_data` and `_loyalty_pg_data`
volumes were preserved. No `down -v`, prune, reset or reseeding was performed.

The Cinema database already contained one movie, four sessions and 11 applied
migrations. It was used as found. The local loyalty database initially had no
public tables; the repository's 15 existing Prisma migrations initialized that
empty database. No catalogue or achievement records were fabricated. Starting
the real loyalty consumers processed an already queued ticket-purchase event;
normal runtime background processing remains enabled as requested.

## Persistent processes and local configuration

| Process | PID at handoff | Launch |
| --- | --- | --- |
| API | 25588 | `dotnet bin/Debug/net10.0/Cinema.Api.dll`, working directory `cinema-platform-back/src/Host/Cinema.Api` |
| Loyalty | 25056 | `node dist/main.js`, working directory `cinema-loyalty-service` |
| Frontend launcher | 22620 | `bun run dev --host 127.0.0.1 --port 5176 --strictPort`, working directory `cinema-platform-front` |

The frontend's Vite listener is child process 21452; stop the Bun process tree
as shown below to stop both.

These were detached with Windows `Start-Process -WindowStyle Hidden`, with
stdout/stderr redirected to `%TEMP%\cinema-phase4`. They remained reachable in
subsequent independent checks. They are not short-lived shell background jobs.
PID files are `backend.pid`, `loyalty.pid` and `frontend.pid` in that directory.
Logs use `backend`, `loyalty` and `frontend` prefixes with `.stdout.log` /
`.stderr.log`. A separate QA Vite instance runs on `:5175`; the pre-existing
`:5174` instance was left alone.

Frontend process environment points `VITE_API_URL` to the local `/api` base,
`VITE_TICKET_HUB_URL` to the local `/tickets` hub and disables WIP mode. No tracked
environment file was changed. Backend uses Development settings with explicit
local DB/Redis/RabbitMQ/gRPC connections and localhost frontend CORS origins.
Loyalty's process-only settings use the existing compose credentials, localhost
dependencies and the existing backend internal service key. No credentials are
included in this report.

**Development startup seeds automatically in the current backend.** To honor the
no-seeder requirement, its actual host was compiled with a temporary MSBuild
target replacing only the startup entry. That entry skips the database initializer
(migration + seeding), identity seeder and HTTPS redirection for the local HTTP
profile. The API modules and endpoints are otherwise the existing implementation.
Temporary files: `%TEMP%\cinema-phase4\NoSeed.targets` and `Program.NoSeed.cs`.
The build used:

```powershell
$taskDir = Join-Path $env:TEMP 'cinema-phase4'
dotnet build src/Host/Cinema.Api --no-restore `
  -p:CustomAfterMicrosoftCommonTargets="$taskDir/NoSeed.targets" `
  -p:CinemaLocalProgram="$taskDir/Program.NoSeed.cs"
```

No tracked backend or loyalty files remain changed. Locked loyalty dependencies
were installed, the existing Prisma client generated, and Nest built; generated
source-only formatting differences were restored after compilation. The running
service uses its compiled output. A normal future backend build uses the original
entry again; its Development seeding behavior is unchanged in source.

## Actual smoke-test results

- `GET /api/movies`: **200**, one existing movie, “Дюна: Частина друга”.
- `GET /api/sessions`: **200**, four existing sessions.
- Browser reads of movies, sessions and halls: **200**.
- Swagger UI and OpenAPI JSON: **200**.
- Authenticated read-only loyalty `GetAdminAchievements`: success, total zero.
- Real desktop Home → Ticket Menu → Sessions works; no console/runtime errors
  on Home/Sessions. Real mobile Home → Ticket Menu → About renders the expected
  About heading, closes the menu, restores scrolling and has no horizontal overflow.
- All listed service and dependency ports remained reachable after setup.

The four sessions are dated 9, 24 and 25 October 2026, before today's date. The
current Sessions page correctly shows no sessions for today; no dates were
rewritten and no sessions were added. Existing movie metadata is sparse, so the
real Home has an empty description and zero rating from the API.

Known existing external-resource issue: About requests
`https://grainy-gradients.vercel.app/noise.svg`, which returns **402** and produces
one resource console error. Header/Menu introduce no external asset request.
That unrelated page was not changed. Live login, payment, SMTP, TMDB/Gemini and
admin mutations were not exercised; this report does not claim they were tested.

## Stop manually when finished

Do not stop them as task cleanup. When you choose to stop the application:

```powershell
$taskDir = Join-Path $env:TEMP 'cinema-phase4'
# Frontend launcher has a Vite child; stop its process tree.
taskkill /PID (Get-Content "$taskDir/frontend.pid") /T /F
Stop-Process -Id (Get-Content "$taskDir/backend.pid")
Stop-Process -Id (Get-Content "$taskDir/loyalty.pid")

# Run from cinema-platform-back; preserves volumes and database state.
docker compose stop cinema-db cinema-redis cinema-rabbitmq loyalty-db
```

The QA Vite instance on `:5175` belongs to the Codex execution terminal session;
Ctrl+C in that terminal stops it. These commands do not stop the pre-existing
`:5174` server.
