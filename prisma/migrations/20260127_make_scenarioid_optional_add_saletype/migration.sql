-- AlterTable: Make scenarioId nullable in invoices table
-- This is SAFE - existing data will remain intact
ALTER TABLE "invoices" ALTER COLUMN "scenario_id" DROP NOT NULL;

-- AlterTable: Add saleType column to invoice_items table
-- This is SAFE - adds a new nullable column, existing data preserved
ALTER TABLE "invoice_items" ADD COLUMN "sale_type" TEXT;
