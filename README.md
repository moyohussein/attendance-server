# Attendance Management Server

A comprehensive attendance tracking system built as a Cloudflare Worker using Hono, Drizzle ORM, and D1 database. This system allows schools to digitally manage student attendance with role-based access control for school owners, teachers, and administrators.

## Features

- **Multi-tenant architecture**: Each school's data is completely isolated
- **Role-based access control**: Super Admin, School Owner, and Teacher roles
- **Comprehensive attendance tracking**: Mark attendance with status (present/absent/late)
- **Analytics dashboard**: Attendance rates and performance metrics
- **Teacher invitation system**: Secure onboarding of teachers via email
- **Student and class management**: Full CRUD operations for academic structure
- **Complete API documentation**: Well-documented endpoints with OpenAPI specs
- **Google OAuth integration**: Sign in with Google accounts

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: JWT Tokens
- **Validation**: Zod
- **API Documentation**: OpenAPI with Swagger UI

## API Contract

Complete API contract documentation is available in [api-contract.md](./api-contract.md), including all endpoints, request/response schemas, authentication requirements, and security measures.

## Setup

### 1. Update wrangler configs and environment variables

Update `wrangler.jsonc` and configure it based on your project:

```bash
cp .dev.vars.example .dev.vars
```

Then update the values in `.dev.vars` with your database configuration.

### 2. Create D1 database
```bash
pnpm run db:create attendance-db --local # for local db
pnpm run db:create attendance-db         # for cloudflare db
```

### 3. Update wrangler.jsonc with database binding
```json
{
  "d1_databases": [
        {
			"binding": "DB",
			"database_name": "attendance-db",
			"database_id": "<your-db-id>"
	    }
  ]
}
```

### 4. Generate and apply database migrations
```bash
pnpm run db:generate # to generate migration files
pnpm run db:apply attendance-db --local # for local db
pnpm run db:apply attendance-db         # for cloudflare db
```

### 5. Run project locally
```bash
pnpm run dev
```

### 6. Deploy project to Workers
```bash
pnpm run deploy
```

## Development

- API documentation is available at `/swagger` when running locally
- All API endpoints are documented in the [API Contract](./api-contract.md)
- Use the provided DTOs and OpenAPI specs for type safety

## Security

- JWT-based authentication with role-based access control
- Multi-tenant data isolation
- SQL injection prevention via Drizzle ORM prepared statements
- Input validation using Zod schemas
- Rate limiting (to be implemented)

## Google OAuth Setup

To enable Google OAuth, you need to configure the following environment variables:

1. Create a Google OAuth application in the [Google Cloud Console](https://console.cloud.google.com/)
2. Set the authorized redirect URI to your callback endpoint (e.g., `https://your-domain.com/api/auth/google/callback`)
3. Add the following environment variables to your `.dev.vars` file:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

The application uses a Cloudflare Workers-compatible OAuth implementation that follows the OAuth 2.0 specification. The system links Google accounts with the application's user schema automatically.

## Architecture

The application follows a modular architecture with:
- Controllers handling HTTP requests
- Services containing business logic
- DTOs for data validation
- OpenAPI specifications for API documentation
- Middleware for authentication and authorization
- Drizzle models for database schemas