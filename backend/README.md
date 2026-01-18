# Trading Journal Backend

Backend API untuk Trading Journal & Analytics Platform menggunakan NestJS, PostgreSQL, dan Prisma.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 15
- Docker & Docker Compose (optional, recommended)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your database credentials
```

## Database Setup

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### Option 2: Local PostgreSQL

Make sure PostgreSQL is running locally and update `.env` with your connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/trading_journal"
```

Then run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Trades

- `POST /api/trades` - Create new trade (protected)
- `GET /api/trades` - Get all trades with filters (protected)
- `GET /api/trades/statistics` - Get trade statistics (protected)
- `GET /api/trades/:id` - Get trade by ID (protected)
- `PATCH /api/trades/:id` - Update trade (protected)
- `DELETE /api/trades/:id` - Delete trade (protected)

### Analytics

- `GET /api/analytics/overview` - Get performance overview (protected)
- `GET /api/analytics/performance-chart` - Get cumulative P&L data (protected)
- `GET /api/analytics/monthly-performance` - Get monthly breakdown (protected)

### Portfolios, Tags (Coming Soon)

## Environment Variables

```env
DATABASE_URL="postgresql://trading_user:trading_pass@localhost:5432/trading_journal"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

## Prisma Commands

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Format schema
npx prisma format
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f backend
```

## Project Structure

```
src/
├── auth/                 # Authentication module (JWT, Guards, Strategies)
├── users/                # Users module
├── trades/               # Trades module (Core feature)
├── portfolios/           # Portfolios module
├── tags/                 # Tags module
├── analytics/            # Analytics module
├── prisma/               # Prisma service
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

## License

MIT
