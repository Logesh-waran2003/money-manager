/*
  Warnings:

  - You are about to drop the column `amount` on the `RecurringPayment` table. All the data in the column will be lost.
  - Added the required column `defaultAmount` to the `RecurringPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringPayment" DROP COLUMN "amount",
ADD COLUMN     "counterparty" TEXT,
ADD COLUMN     "customIntervalDays" INTEGER,
ADD COLUMN     "defaultAmount" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "RecurringPayment_accountId_idx" ON "RecurringPayment"("accountId");

-- CreateIndex
CREATE INDEX "RecurringPayment_categoryId_idx" ON "RecurringPayment"("categoryId");

-- AddForeignKey
ALTER TABLE "RecurringPayment" ADD CONSTRAINT "RecurringPayment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringPayment" ADD CONSTRAINT "RecurringPayment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
