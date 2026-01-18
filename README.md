# Trading Journal & Analytics Platform

A full-stack trading journal and analytics platform that helps traders track their trades, analyze performance, and gain insights into their trading strategies.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![NestJS](https://img.shields.io/badge/NestJS-10-red) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 🚀 Features

- ✅ **Trade Journal** - Record and manage trades with detailed information
- 📊 **Analytics Dashboard** - Visualize trading performance with interactive charts
- 💼 **Portfolio Tracking** - Monitor portfolio value and positions
- 📈 **Performance Metrics** - Calculate win rate, profit factor, risk/reward ratios
- 🏷️ **Tags & Categories** - Organize trades by strategy, market, timeframe
- 🔐 **User Authentication** - Secure multi-user support with JWT + RBAC

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator

### Deployment

- **Containerization**: Docker + Docker Compose
- **Frontend Deploy**: Vercel
- **Backend Deploy**: Railway

## 📁 Project Structure

```
trading_journal/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── types/         # TypeScript interfaces
│   └── README.md
│
├── backend/               # NestJS backend API
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── trades/        # Trades module (core)
│   │   ├── analytics/     # Analytics module
│   │   ├── portfolios/    # Portfolios module
│   │   └── prisma/        # Prisma service
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── README.md
│
├── docker-compose.yml     # Docker orchestration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd trading_journal
```

2. **Setup Environment Variables**

```bash
# Copy example env file
cp .env.example .env

# Update .env with your credentials
```

3. **Start Docker Services**

```bash
# Start PostgreSQL database
docker-compose up -d postgres
```

4. **Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start backend server
npm run start:dev
```

Backend will be available at `http://localhost:3000/api`

5. **Setup Frontend** (In a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🐳 Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
  - Body: `{ email, password, name? }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ access_token, user }`

- `GET /api/auth/profile` - Get current user profile
  - Headers: `Authorization: Bearer <token>`

### Trades Endpoints

- `POST /api/trades` - Create new trade
- `GET /api/trades` - Get all trades (with filters & pagination)
- `GET /api/trades/statistics` - Get trade statistics
- `GET /api/trades/:id` - Get trade by ID
- `PATCH /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

### Analytics Endpoints

- `GET /api/analytics/overview` - Get performance overview
- `GET /api/analytics/performance-chart` - Get cumulative P&L data
- `GET /api/analytics/monthly-performance` - Get monthly breakdown

All protected endpoints require `Authorization: Bearer <token>` header.

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test
```

## 📝 Development Workflow

1. **Backend Development**
   - Make schema changes in `backend/prisma/schema.prisma`
   - Run `npx prisma migrate dev --name description`
   - Update services and controllers
2. **Frontend Development**
   - Create/update components in `frontend/src/components`
   - Use React Query hooks for API calls
   - Style with Tailwind CSS

3. **Database Management**

   ```bash
   # Open Prisma Studio (Database GUI)
   npx prisma studio

   # Reset database
   npx prisma migrate reset
   ```

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://trading_user:trading_pass@localhost:5432/trading_journal"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)

```env
VITE_API_URL="http://localhost:3000/api"
```

## 📦 Database Schema

### Core Models

- **User** - User accounts with authentication
- **Trade** - Individual trade records with P&L calculations
- **Portfolio** - Trading accounts and balance tracking
- **Tag** - Categorization and organization
- **PortfolioHistory** - Historical balance snapshots

See `backend/prisma/schema.prisma` for complete schema definition.

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_API_URL=<your-backend-url>`
3. Deploy automatically on push to main

### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Add PostgreSQL database
3. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy automatically on push to main

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📄 License

MIT

## 👤 Author

Your Name

---

**Status**: ✅ Backend Complete | ⏳ Frontend In Progress

For detailed setup instructions, see the README files in `/backend` and `/frontend` directories.
