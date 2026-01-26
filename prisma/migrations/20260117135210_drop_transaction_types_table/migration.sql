/*
  Warnings:

  - You are about to drop the `transaction_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transaction_types" DROP CONSTRAINT "transaction_types_user_id_fkey";

-- DropTable
DROP TABLE "transaction_types";
