-- First, remove the self-relation constraint if it exists
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_creditId_fkey";

-- Update the Credit table with new fields
ALTER TABLE "Credit" 
ADD COLUMN IF NOT EXISTS "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isFullySettled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3);

-- Create index on dueDate if it doesn't exist
CREATE INDEX IF NOT EXISTS "Credit_dueDate_idx" ON "Credit"("dueDate");

-- Add the new foreign key constraint for Transaction to Credit
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Credit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
