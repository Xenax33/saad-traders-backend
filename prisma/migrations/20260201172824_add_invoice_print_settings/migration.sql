-- CreateTable
CREATE TABLE "invoice_print_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "visible_fields" JSONB NOT NULL,
    "column_widths" JSONB NOT NULL,
    "include_custom_fields" BOOLEAN NOT NULL DEFAULT true,
    "custom_fields_position" TEXT NOT NULL DEFAULT 'end',
    "font_size" TEXT NOT NULL DEFAULT 'small',
    "table_borders" BOOLEAN NOT NULL DEFAULT true,
    "show_item_numbers" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_print_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_print_settings_user_id_key" ON "invoice_print_settings"("user_id");

-- CreateIndex
CREATE INDEX "invoice_print_settings_user_id_idx" ON "invoice_print_settings"("user_id");

-- AddForeignKey
ALTER TABLE "invoice_print_settings" ADD CONSTRAINT "invoice_print_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
