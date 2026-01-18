-- Trading Journal Database Schema
-- Manual migration script as workaround

-- Create custom types
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TradeType" AS ENUM ('LONG', 'SHORT');
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE "TagType" AS ENUM ('STRATEGY', 'MARKET', 'SETUP', 'TIMEFRAME', 'OTHER');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolios table
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "initialBalance" DECIMAL(18,8) NOT NULL,
    "currentBalance" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create tags table
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagType" NOT NULL DEFAULT 'OTHER',
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE("userId", "name")
);

-- Create trades table
CREATE TABLE "trades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "portfolioId" TEXT,
    "symbol" TEXT NOT NULL,
    "type" "TradeType" NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'CLOSED',
    "entryPrice" DECIMAL(18,8) NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "exitPrice" DECIMAL(18,8),
    "exitDate" TIMESTAMP(3),
    "stopLoss" DECIMAL(18,8),
    "takeProfit" DECIMAL(18,8),
    "profitLoss" DECIMAL(18,8),
    "commission" DECIMAL(18,8),
    "netProfitLoss" DECIMAL(18,8),
    "notes" TEXT,
    "screenshots" TEXT[],
    "strategy" TEXT,
    "timeframe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE SET NULL
);

-- Create portfolio_history table
CREATE TABLE "portfolio_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL,
    "equity" DECIMAL(18,8),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE
);

-- Create trade-tag junction table (many-to-many)
CREATE TABLE "_TradeTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "tags"("id") ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES "trades"("id") ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX "portfolios_userId_idx" ON "portfolios"("userId");
CREATE INDEX "tags_userId_idx" ON "tags"("userId");
CREATE INDEX "tags_type_idx" ON "tags"("type");
CREATE INDEX "trades_userId_idx" ON "trades"("userId");
CREATE INDEX "trades_portfolioId_idx" ON "trades"("portfolioId");
CREATE INDEX "trades_symbol_idx" ON "trades"("symbol");
CREATE INDEX "trades_entryDate_idx" ON "trades"("entryDate");
CREATE INDEX "trades_status_idx" ON "trades"("status");
CREATE INDEX "portfolio_history_portfolioId_idx" ON "portfolio_history"("portfolioId");
CREATE INDEX "portfolio_history_date_idx" ON "portfolio_history"("date");

-- Create unique indexes for many-to-many relationship
CREATE UNIQUE INDEX "_TradeTags_AB_unique" ON "_TradeTags"("A", "B");
CREATE INDEX "_TradeTags_B_index" ON "_TradeTags"("B");

-- Done! Database schema created successfully.
