/*
  Warnings:

  - You are about to drop the column `sale_type` on the `invoice_items` table. All the data in the column will be lost.
  - Added the required column `transaction_type_id` to the `invoice_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice_items" DROP COLUMN "sale_type",
ADD COLUMN     "transaction_type_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "transaction_types" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_type_id" TEXT NOT NULL,
    "transaction_type_desc" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_types_user_id_transaction_type_id_key" ON "transaction_types"("user_id", "transaction_type_id");

-- AddForeignKey
ALTER TABLE "transaction_types" ADD CONSTRAINT "transaction_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
