/*
  Warnings:

  - You are about to drop the column `transaction_type_id` on the `invoice_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_transaction_type_id_fkey";

-- AlterTable
ALTER TABLE "invoice_items" DROP COLUMN "transaction_type_id";
