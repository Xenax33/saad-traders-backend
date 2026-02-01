-- Step 1: Create new table with invoice_item_id instead of invoice_id
CREATE TABLE "invoice_item_custom_field_values" (
    "id" TEXT NOT NULL,
    "invoice_item_id" TEXT NOT NULL,
    "custom_field_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_item_custom_field_values_pkey" PRIMARY KEY ("id")
);

-- Step 2: Migrate existing data from invoice level to item level
-- For each invoice with custom field values, copy them to ALL items in that invoice
INSERT INTO "invoice_item_custom_field_values" ("id", "invoice_item_id", "custom_field_id", "value", "created_at", "updated_at")
SELECT 
    gen_random_uuid(),
    ii.id as invoice_item_id,
    icfv.custom_field_id,
    icfv.value,
    icfv.created_at,
    NOW() as updated_at
FROM "invoice_custom_field_values" icfv
INNER JOIN "invoice_items" ii ON ii.invoice_id = icfv.invoice_id;

-- Step 3: Create indexes
CREATE UNIQUE INDEX "invoice_item_custom_field_values_invoice_item_id_custom_field_id_key" 
ON "invoice_item_custom_field_values"("invoice_item_id", "custom_field_id");

-- Step 4: Add foreign key constraints
ALTER TABLE "invoice_item_custom_field_values" 
ADD CONSTRAINT "invoice_item_custom_field_values_invoice_item_id_fkey" 
FOREIGN KEY ("invoice_item_id") REFERENCES "invoice_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invoice_item_custom_field_values" 
ADD CONSTRAINT "invoice_item_custom_field_values_custom_field_id_fkey" 
FOREIGN KEY ("custom_field_id") REFERENCES "custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop old table
DROP TABLE "invoice_custom_field_values";
