/*
  Warnings:

  - You are about to drop the column `transferGroupId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_transferGroupId_idx";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "color" SET DEFAULT '#10b981';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transferGroupId",
ADD COLUMN     "transferAccountId" TEXT,
ADD COLUMN     "transferAmount" DECIMAL(19,4);

-- CreateIndex
CREATE INDEX "Transaction_transferAccountId_idx" ON "Transaction"("transferAccountId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferAccountId_fkey" FOREIGN KEY ("transferAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
