-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CLEARED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('EMERGENCY_FUND', 'VACATION', 'CAR', 'HOUSE', 'RETIREMENT', 'EDUCATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'ETF', 'MUTUAL_FUND', 'CRYPTO', 'BOND', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BUDGET_WARNING', 'BUDGET_EXCEEDED', 'GOAL_MILESTONE', 'GOAL_COMPLETED', 'BILL_REMINDER', 'RECURRING_POSTED', 'LARGE_TRANSACTION', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "primaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimalDigits" INTEGER NOT NULL DEFAULT 2,
    "flag" TEXT,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCode" TEXT NOT NULL,
    "quoteCode" TEXT NOT NULL,
    "rate" DECIMAL(20,10) NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "initialBalance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "balance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "institution" TEXT,
    "mask" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT,
    "creditLimit" DECIMAL(19,4),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "parentId" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#94a3b8',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "merchant" TEXT,
    "notes" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CLEARED',
    "transferGroupId" TEXT,
    "recurringId" TEXT,
    "isExcludedFromReports" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionTag" (
    "transactionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TransactionTag_pkey" PRIMARY KEY ("transactionId","tagId")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "rollover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GoalType" NOT NULL DEFAULT 'CUSTOM',
    "targetAmount" DECIMAL(19,4) NOT NULL,
    "currentAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "targetDate" TIMESTAMP(3),
    "accountId" TEXT,
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "icon" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalContribution" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "frequency" "RecurringFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextRunDate" TIMESTAMP(3) NOT NULL,
    "lastRunDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoPost" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(28,10) NOT NULL,
    "costBasis" DECIMAL(19,4) NOT NULL,
    "latestPrice" DECIMAL(19,4),
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "priceUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetWorthSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "netWorth" DECIMAL(19,4) NOT NULL,
    "assets" DECIMAL(19,4) NOT NULL,
    "liabilities" DECIMAL(19,4) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_primaryCurrency_idx" ON "User"("primaryCurrency");

-- CreateIndex
CREATE INDEX "ExchangeRate_baseCode_quoteCode_idx" ON "ExchangeRate"("baseCode", "quoteCode");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_baseCode_quoteCode_asOf_key" ON "ExchangeRate"("baseCode", "quoteCode", "asOf");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_isArchived_idx" ON "Account"("userId", "isArchived");

-- CreateIndex
CREATE INDEX "Account_currencyCode_idx" ON "Account"("currencyCode");

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE INDEX "Category_userId_type_idx" ON "Category"("userId", "type");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- CreateIndex
CREATE INDEX "Transaction_accountId_date_idx" ON "Transaction"("accountId", "date");

-- CreateIndex
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

-- CreateIndex
CREATE INDEX "Transaction_transferGroupId_idx" ON "Transaction"("transferGroupId");

-- CreateIndex
CREATE INDEX "Transaction_recurringId_idx" ON "Transaction"("recurringId");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "TransactionTag_tagId_idx" ON "TransactionTag"("tagId");

-- CreateIndex
CREATE INDEX "Budget_userId_startDate_idx" ON "Budget"("userId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_categoryId_period_startDate_key" ON "Budget"("userId", "categoryId", "period", "startDate");

-- CreateIndex
CREATE INDEX "Goal_userId_status_idx" ON "Goal"("userId", "status");

-- CreateIndex
CREATE INDEX "GoalContribution_goalId_idx" ON "GoalContribution"("goalId");

-- CreateIndex
CREATE INDEX "GoalContribution_userId_idx" ON "GoalContribution"("userId");

-- CreateIndex
CREATE INDEX "RecurringTransaction_userId_idx" ON "RecurringTransaction"("userId");

-- CreateIndex
CREATE INDEX "RecurringTransaction_nextRunDate_isActive_idx" ON "RecurringTransaction"("nextRunDate", "isActive");

-- CreateIndex
CREATE INDEX "Holding_userId_idx" ON "Holding"("userId");

-- CreateIndex
CREATE INDEX "Holding_accountId_idx" ON "Holding"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_accountId_symbol_key" ON "Holding"("accountId", "symbol");

-- CreateIndex
CREATE INDEX "NetWorthSnapshot_userId_date_idx" ON "NetWorthSnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NetWorthSnapshot_userId_date_key" ON "NetWorthSnapshot"("userId", "date");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");

-- CreateIndex
CREATE INDEX "Attachment_transactionId_idx" ON "Attachment"("transactionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_primaryCurrency_fkey" FOREIGN KEY ("primaryCurrency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_baseCode_fkey" FOREIGN KEY ("baseCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_quoteCode_fkey" FOREIGN KEY ("quoteCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "RecurringTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
