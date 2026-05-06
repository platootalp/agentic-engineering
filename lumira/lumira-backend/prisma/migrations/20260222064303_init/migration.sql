-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('STOCK', 'BOND', 'MIX', 'INDEX', 'QDII', 'FOF', 'MONEY');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'LOW_MEDIUM', 'MEDIUM', 'MEDIUM_HIGH', 'HIGH');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL', 'DIVIDEND');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "default_time_range" TEXT NOT NULL DEFAULT '1y',
    "refresh_interval" INTEGER NOT NULL DEFAULT 30,
    "show_estimate_warning" BOOLEAN NOT NULL DEFAULT true,
    "hidden_funds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "groups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FundType" NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "company" TEXT NOT NULL,
    "manager_id" TEXT,
    "manager_name" TEXT,
    "nav" DECIMAL(10,4) NOT NULL,
    "accum_nav" DECIMAL(10,4) NOT NULL,
    "nav_date" TEXT NOT NULL,
    "fee_rate_buy" DECIMAL(5,4) NOT NULL,
    "fee_rate_sell" DECIMAL(5,4) NOT NULL,
    "fee_rate_mgmt" DECIMAL(5,4) NOT NULL,
    "fee_rate_custody" DECIMAL(5,4),
    "scale" DECIMAL(15,2),
    "establish_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_nav_history" (
    "id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "nav" DECIMAL(10,4) NOT NULL,
    "accum_nav" DECIMAL(10,4) NOT NULL,
    "change" DECIMAL(10,4),
    "change_percent" DECIMAL(8,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fund_nav_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "fund_name" TEXT NOT NULL,
    "fund_type" "FundType" NOT NULL,
    "total_shares" DECIMAL(15,4) NOT NULL,
    "avg_cost" DECIMAL(10,4) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "channel" TEXT,
    "group" TEXT,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "holding_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "fund_name" TEXT,
    "type" "TransactionType" NOT NULL,
    "date" TEXT NOT NULL,
    "shares" DECIMAL(15,4) NOT NULL,
    "price" DECIMAL(10,4) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "funds_type_idx" ON "funds"("type");

-- CreateIndex
CREATE INDEX "funds_risk_level_idx" ON "funds"("risk_level");

-- CreateIndex
CREATE INDEX "fund_nav_history_fund_id_idx" ON "fund_nav_history"("fund_id");

-- CreateIndex
CREATE INDEX "fund_nav_history_date_idx" ON "fund_nav_history"("date");

-- CreateIndex
CREATE UNIQUE INDEX "fund_nav_history_fund_id_date_key" ON "fund_nav_history"("fund_id", "date");

-- CreateIndex
CREATE INDEX "holdings_user_id_idx" ON "holdings"("user_id");

-- CreateIndex
CREATE INDEX "holdings_fund_id_idx" ON "holdings"("fund_id");

-- CreateIndex
CREATE INDEX "holdings_user_id_fund_id_idx" ON "holdings"("user_id", "fund_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_holding_id_idx" ON "transactions"("holding_id");

-- CreateIndex
CREATE INDEX "transactions_fund_id_idx" ON "transactions"("fund_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_nav_history" ADD CONSTRAINT "fund_nav_history_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "holdings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
