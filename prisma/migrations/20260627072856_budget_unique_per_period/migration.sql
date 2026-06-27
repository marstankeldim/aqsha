-- Replace the (userId, categoryId, period, startDate) unique with
-- (userId, categoryId, period) to match the one-budget-per-category rule.

-- DropIndex
DROP INDEX "Budget_userId_categoryId_period_startDate_key";

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_categoryId_period_key" ON "Budget"("userId", "categoryId", "period");
