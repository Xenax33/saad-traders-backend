/*
  Warnings:

  - A unique constraint covering the columns `[user_id,hs_code]` on the table `hs_codes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `hs_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "hs_codes_hs_code_key";

-- AlterTable
ALTER TABLE "hs_codes" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ntn_cnic" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "registration_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "invoice_type" TEXT NOT NULL,
    "invoice_date" DATE NOT NULL,
    "invoice_ref_no" TEXT,
    "fbr_invoice_number" TEXT,
    "fbr_response" JSONB,
    "is_test_environment" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "hs_code_id" TEXT NOT NULL,
    "product_description" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "unit_of_measurement" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "total_values" DECIMAL(15,2) NOT NULL,
    "value_sales_excluding_st" DECIMAL(15,2) NOT NULL,
    "fixed_notified_value_or_retail_price" DECIMAL(15,2) NOT NULL,
    "sales_tax_applicable" DECIMAL(15,2) NOT NULL,
    "sales_tax_withheld_at_source" DECIMAL(15,2) NOT NULL,
    "extra_tax" TEXT,
    "further_tax" DECIMAL(15,2) NOT NULL,
    "sro_schedule_no" TEXT,
    "fed_payable" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL,
    "sale_type" TEXT,
    "sro_item_serial_no" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyers_user_id_ntn_cnic_key" ON "buyers"("user_id", "ntn_cnic");

-- CreateIndex
CREATE UNIQUE INDEX "hs_codes_user_id_hs_code_key" ON "hs_codes"("user_id", "hs_code");

-- AddForeignKey
ALTER TABLE "hs_codes" ADD CONSTRAINT "hs_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_hs_code_id_fkey" FOREIGN KEY ("hs_code_id") REFERENCES "hs_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
