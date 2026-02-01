-- CreateTable: custom_fields
CREATE TABLE "custom_fields" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable: invoice_custom_field_values
CREATE TABLE "invoice_custom_field_values" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "custom_field_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_user_id_field_name_key" ON "custom_fields"("user_id", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_custom_field_values_invoice_id_custom_field_id_key" ON "invoice_custom_field_values"("invoice_id", "custom_field_id");

-- AddForeignKey
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_custom_field_values" ADD CONSTRAINT "invoice_custom_field_values_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_custom_field_values" ADD CONSTRAINT "invoice_custom_field_values_custom_field_id_fkey" FOREIGN KEY ("custom_field_id") REFERENCES "custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
