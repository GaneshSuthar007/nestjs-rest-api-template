# NestJS REST API Template

A **NestJS REST API template** built from patterns refined across a decade of Node.js backends — and running in production today. Clone it, rename it, start shipping features. The infrastructure (auth, validation, error handling, logging, pagination, response contracts) is already done and consistent.

[![CI](https://github.com/GaneshSuthar007/nestjs-rest-api-template/actions/workflows/ci.yml/badge.svg)](../../actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why this template?

Most NestJS starters give you an empty `AppModule` and leave every architectural decision to you. This template makes those decisions once, opinionatedly, and enforces them through structure:

- 🔐 **Two-layer security** — a global `x-api-key` guard on *every* request, plus JWT auth (with role-based access control) where needed
- 📦 **One response contract** — every success and every error leaves the API in the same JSON shape; Flutter/React/mobile clients only ever parse one format
- ✅ **Joi validation** — schema-per-endpoint, colocated with its DTO, applied per handler
- 🗄️ **Prisma ORM** — snake_case tables, camelCase fields, a shared client, and a generic DB-level pagination service
- 🧱 **Copy-paste feature modules** — every feature follows the exact same four-file shape; adding an endpoint is mechanical, not creative
- 📝 **Centralized messages** — zero hardcoded user-facing strings; everything lives in one namespaced file, i18n-ready
- 📊 **Winston logging** — every request logged with duration, every error logged with context, via a global interceptor + exception filter

---

## Project structure

```
├── prisma/
│   └── schema.prisma            # Data models (example: User + Todo)
├── src/
│   ├── main.ts                  # Bootstrap: helmet, CORS, URI versioning (/v1),
│   │                            # global ApiKeyGuard + HttpExceptionFilter
│   ├── app.module.ts            # Root module: config + features + global logger interceptor
│   │
│   ├── core/                    # ⚙️  INFRASTRUCTURE — you rarely touch this
│   │   ├── config/
│   │   │   └── config.module.ts         # Joi-validated env vars (app refuses to boot if invalid)
│   │   ├── database/
│   │   │   ├── prisma.service.ts        # Shared Prisma client (connect/disconnect lifecycle)
│   │   │   ├── pagination.service.ts    # Generic skip/take + count pagination for any model
│   │   │   └── database.module.ts       # Exports both; imported by every feature module
│   │   ├── auth/
│   │   │   ├── strategies/jwt.strategy.ts   # Bearer-token validation, re-fetches user from DB
│   │   │   └── guards/
│   │   │       ├── api-key.guard.ts         # Global — every request needs x-api-key
│   │   │       ├── jwt.guard.ts             # Per-route — requires a logged-in user
│   │   │       └── roles.guard.ts           # Per-route — RBAC (ADMIN always passes)
│   │   ├── logger/
│   │   │   ├── logger.ts                    # Winston instance
│   │   │   ├── api-logger.interceptor.ts    # Logs every request + duration (global)
│   │   │   └── http-exception.filter.ts     # Formats ALL errors into one JSON shape (global)
│   │   ├── pipes/
│   │   │   └── joi-validation.pipe.ts       # Runs a Joi schema against body/query/params
│   │   └── utils/
│   │       └── response.util.ts             # ResponseUtil.ok() / .created() — the success contract
│   │
│   ├── apis/                    # 🚀 FEATURES — this is where you work
│   │   ├── apis.module.ts               # Registry: every feature module is listed here
│   │   ├── auth/                        # Register + login (issues JWTs)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── dto/auth.dto.ts
│   │   └── todo/                        # ⭐ CANONICAL EXAMPLE — copy this to add a feature
│   │       ├── todo.module.ts
│   │       ├── todo.controller.ts
│   │       ├── todo.service.ts
│   │       └── dto/todo.dto.ts
│   │
│   └── common/                  # 🔤 SHARED, DEPENDENCY-FREE code
│       ├── messages.ts                  # ALL user-facing strings, namespaced per feature
│       ├── constants.ts                 # Non-env constants (page sizes, bcrypt rounds…)
│       ├── decorators/
│       │   ├── get-user.decorator.ts    # @GetUser() → authenticated user from the request
│       │   └── roles.decorator.ts       # @Roles(UserRole.ADMIN) metadata for RolesGuard
│       └── types/
│           ├── response.types.ts        # The Response<T> success contract
│           └── pagination.types.ts      # PaginationQuery / PaginatedResult<T>
└── .github/workflows/ci.yml    # Lint + build on every push/PR
```

### The three layers, in one sentence each

| Layer | Folder | Rule of thumb |
|---|---|---|
| **Infrastructure** | `src/core/` | Cross-cutting machinery (auth, DB, logging, validation, response shape). Written once, imported everywhere, rarely modified. |
| **Features** | `src/apis/` | One folder per business capability. Each is self-contained: module + controller + service + DTOs. 95% of your work happens here. |
| **Shared** | `src/common/` | Plain constants, types, strings, and decorators with no framework wiring — safe to import from anywhere without circular-dependency risk. |

### Why the boundary matters

This isn't theoretical. This architecture recently went from **TypeORM to Prisma** — and the controllers, services, validation schemas, and response contracts didn't change. The swap was contained to `src/core/database/`, because the feature modules never knew which ORM was underneath them in the first place.

That's the whole argument for putting infrastructure behind a boundary: you don't feel the benefit until the day you have to change something you assumed you never would.

---

## Request lifecycle

Understanding what happens to a single request explains the whole architecture:

```
HTTP Request
   │
   ├─ 1. helmet + CORS                        (main.ts)
   ├─ 2. ApiKeyGuard        → 401 if x-api-key is wrong        [global]
   ├─ 3. JwtGuard           → 401 if Bearer token invalid       [per route]
   │       └─ JwtStrategy re-fetches the user from the DB
   ├─ 4. RolesGuard         → 403 if role not allowed           [per route]
   ├─ 5. JoiValidationPipe  → 400 with readable message         [per handler]
   ├─ 6. Controller         → thin: delegates to service, wraps with ResponseUtil
   ├─ 7. Service            → business logic + Prisma, throws HttpExceptions
   │
   ├─ ✅ Success → ApiLoggerInterceptor logs method/path/duration
   │              Response: { status, data, message, timestamp }
   │
   └─ ❌ Any error → HttpExceptionFilter catches EVERYTHING
                  Response: { status, message, timestamp, path }
```

### Response contracts

Every endpoint returns one of exactly two shapes:

```jsonc
// Success (built by ResponseUtil, never by hand)
{
  "status": 200,
  "data": { "...": "..." },
  "message": "Todos fetched successfully.",
  "timestamp": "2026-07-12T10:30:00.000Z"
}

// Error (built by HttpExceptionFilter, no matter where the error came from)
{
  "status": 404,
  "message": "Todo not found.",
  "timestamp": "2026-07-12T10:30:00.000Z",
  "path": "/v1/todos/99"
}
```

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- A MySQL database (or edit `prisma/schema.prisma` → `provider` for PostgreSQL/SQLite)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then edit values (all are validated at boot)

# 3. Generate the Prisma client + create the schema
npm run prisma:generate
npm run migration:dev       # creates and applies the initial migration

# 4. Run
npm run start:dev           # http://localhost:3000/v1
```

### Try it

```bash
API_KEY="change-me-strong-api-key"   # must match .env

# Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# Login → grab data.accessToken from the response
curl -X POST http://localhost:3000/v1/auth/login \
  -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'

TOKEN="<accessToken from login>"

# Create a todo
curl -X POST http://localhost:3000/v1/todos \
  -H "x-api-key: $API_KEY" -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship the template","description":"Post it on LinkedIn"}'

# List todos (DB-level pagination + filtering)
curl "http://localhost:3000/v1/todos?page=1&limit=10&status=PENDING" \
  -H "x-api-key: $API_KEY" -H "Authorization: Bearer $TOKEN"
```

---

## How to add a new feature module

The `todo` module is the canonical reference — adding a feature is a mechanical 6-step copy of it. Example: a `blog` feature.

**1. Model** — add it to `prisma/schema.prisma` (snake_case table via `@@map`, `createdAt`/`updatedAt` on every model), then:

```bash
npm run migration:dev && npm run prisma:generate
```

**2. DTOs + Joi schemas** — `src/apis/blog/dto/blog.dto.ts`. Plain classes, schemas next to them, enums from `@prisma/client`:

```typescript
export class CreateBlogDTO { title: string; body: string; }

export const CreateBlogSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
  body: Joi.string().required(),
}).required().options({ abortEarly: true, allowUnknown: false });
```

**3. Messages** — add a `blog` namespace to `src/common/messages.ts`. No strings in services, ever.

**4. Service** — `src/apis/blog/blog.service.ts`. Inject `PrismaService` (+ `PaginationService` for lists), wrap each method in the try/catch pattern, filter at the DB level.

**5. Controller** — `src/apis/blog/blog.controller.ts`. Thin handlers, `Promise<Response>` return type, `ResponseUtil.ok()`/`.created()`, per-handler `JoiValidationPipe`.

**6. Module + registration** — `src/apis/blog/blog.module.ts` (imports `DatabaseModule`, provides `BlogService` + `JwtStrategy`), then add `BlogModule` to the imports array in `src/apis/apis.module.ts`. **Nothing is auto-discovered.**

Done — the new endpoints automatically inherit API-key protection, error formatting, request logging, and versioning.

### Admin-only routes

```typescript
@Delete("admin/:id")
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async adminDelete(@Param("id", ParseIntPipe) id: number): Promise<Response> { ... }
```

---

## Conventions (the opinionated part)

| Convention | Rule |
|---|---|
| **Validation** | Joi, not `class-validator`. A deliberate choice — nested JSON with `class-validator` means a class per level (`@ValidateNested()` + `@Type()` all the way down), and it gets unwieldy fast. The trade-off is real: the DTO and the schema are maintained separately, and you lose `@nestjs/swagger`'s auto-generation from decorators. Worth it here; reasonable people disagree. One schema per endpoint, colocated with its DTO. |
| **Messages** | All user-facing strings live in `src/common/messages.ts`, namespaced per feature. |
| **Responses** | Controllers return `Promise<Response>` built by `ResponseUtil` — never hand-rolled objects. |
| **Errors** | Services throw `HttpException` subclasses; unexpected errors are wrapped as `BadRequestException`. The global filter formats everything. |
| **Ownership** | Row-level ownership is enforced in the Prisma `where` clause (`{ id, userId }`), not with post-fetch checks. |
| **Lists** | Always DB-level pagination/filtering via `PaginationService` — never fetch-all-then-filter in JS. |
| **Mutations** | Return fresh data (re-fetch or the returned row), never echo the request payload. |
| **DB naming** | Tables snake_case (`@@map`), columns camelCase in Prisma / snake_case in DB (`@map`), `createdAt`/`updatedAt` everywhere. |
| **Registration** | New modules must be added to `apis.module.ts` — nothing is auto-discovered. |

## Environment variables

Validated with Joi at boot (`src/core/config/config.module.ts`) — the app **refuses to start** with a clear error if any are missing/invalid. Unknown extra vars are allowed.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` / `production` / `test` |
| `APP_PORT` | no | `3000` | HTTP port |
| `API_KEY` | **yes** | — | Value every client must send as `x-api-key` (min 16 chars) |
| `JWT_SECRET` | **yes** | — | JWT signing secret (min 16 chars) |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime (`60s`, `1h`, `7d`…) |
| `DATABASE_URL` | **yes** | — | Prisma connection string (app + CLI) |

## Scripts

| Script | What it does |
|---|---|
| `npm run start:dev` | Development server with watch mode |
| `npm run build` | Production build to `dist/` |
| `npm run start:prod` | Run the production build |
| `npm run lint` / `npm run format` | ESLint (fix) / Prettier |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run migration:dev` | Create + apply a migration (development) |
| `npm run migration:create` | Create a migration without applying it |
| `npm run migration:deploy` | Apply pending migrations (production/CI) |
| `npm run migration:status` | Show migration status |
| `npm run prisma:studio` | Browse data in Prisma Studio |

---

## Roadmap / ideas to extend

- [ ] Swagger/OpenAPI docs (`@nestjs/swagger`)
- [ ] Rate limiting (`@nestjs/throttler`)
- [ ] Refresh tokens + logout/blacklisting
- [ ] File uploads (local disk or S3) with a storage service abstraction
- [ ] Unit/e2e tests (Jest + Supertest)
- [ ] Docker + docker-compose (API + MySQL)
- [ ] Health checks (`@nestjs/terminus`) with an API-key bypass for `/health`
- [ ] Caching (`@nestjs/cache-manager`) for read-heavy endpoints

## License

[MIT](LICENSE) — use it, fork it, ship with it. If this template helps you, a ⭐ is appreciated!