/*
  Warnings:

  - You are about to drop the `Credit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Credit" DROP CONSTRAINT "Credit_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_creditId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isFullSettlement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRepayment" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Credit";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
