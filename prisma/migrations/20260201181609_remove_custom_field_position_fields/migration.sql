-- Migration: Remove includeCustomFields and customFieldsPosition columns
-- This migration enables custom fields to be positioned anywhere among regular fields

-- Step 1: For existing records where includeCustomFields = true, append custom field IDs to visibleFields
-- Only process records that have includeCustomFields = true
DO $$
DECLARE
    setting_record RECORD;
    user_custom_fields TEXT[];
    current_visible_fields JSONB;
    updated_visible_fields JSONB;
    current_column_widths JSONB;
    updated_column_widths JSONB;
    custom_field_id TEXT;
BEGIN
    -- Loop through each print settings record
    FOR setting_record IN 
        SELECT id, user_id, visible_fields, column_widths, include_custom_fields
        FROM invoice_print_settings
        WHERE include_custom_fields = true
    LOOP
        -- Get active custom fields for this user
        SELECT ARRAY_AGG('customField_' || id::text)
        INTO user_custom_fields
        FROM custom_fields
        WHERE user_id = setting_record.user_id AND is_active = true;
        
        -- Only proceed if user has custom fields
        IF user_custom_fields IS NOT NULL AND array_length(user_custom_fields, 1) > 0 THEN
            -- Get current visible fields
            current_visible_fields := setting_record.visible_fields;
            
            -- Append custom fields to visible fields
            updated_visible_fields := current_visible_fields;
            FOREACH custom_field_id IN ARRAY user_custom_fields
            LOOP
                updated_visible_fields := updated_visible_fields || to_jsonb(custom_field_id);
            END LOOP;
            
            -- Get current column widths
            current_column_widths := setting_record.column_widths;
            updated_column_widths := current_column_widths;
            
            -- Add default width (10) for each custom field
            FOREACH custom_field_id IN ARRAY user_custom_fields
            LOOP
                updated_column_widths := jsonb_set(
                    updated_column_widths,
                    ARRAY[custom_field_id],
                    '10'::jsonb
                );
            END LOOP;
            
            -- Update the record
            UPDATE invoice_print_settings
            SET 
                visible_fields = updated_visible_fields,
                column_widths = updated_column_widths
            WHERE id = setting_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 2: Drop the columns that are no longer needed
ALTER TABLE "invoice_print_settings" DROP COLUMN IF EXISTS "include_custom_fields";
ALTER TABLE "invoice_print_settings" DROP COLUMN IF EXISTS "custom_fields_position";
