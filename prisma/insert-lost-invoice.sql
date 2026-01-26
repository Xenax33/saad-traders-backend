-- Insert the lost invoice that was successfully posted to FBR
-- Invoice Number: 3520223926179DIABBBOM380503
-- Date: 2026-01-27 01:40:12

DO $$
DECLARE
  v_invoice_id UUID;
BEGIN
  -- Check if invoice already exists
  SELECT id INTO v_invoice_id FROM invoices WHERE fbr_invoice_number = '3520223926179DIABBBOM380503';
  
  IF v_invoice_id IS NULL THEN
    -- Insert the invoice if it doesn't exist
    INSERT INTO invoices (
      id,
      user_id,
      buyer_id,
      scenario_id,
      invoice_type,
      invoice_date,
      invoice_ref_no,
      fbr_invoice_number,
      fbr_response,
      is_test_environment,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '0b4c0575-ad97-4ac3-bb39-af7d2c66959c',
      '80d0b517-befe-4af1-8daa-f0431554dbec',
      NULL,
      'Sale Invoice',
      '2026-01-09',
      'INV-2026-01-09-0001',
      '3520223926179DIABBBOM380503',
      '{"invoiceNumber": "3520223926179DIABBBOM380503", "dated": "2026-01-27 01:40:12", "validationResponse": {"statusCode": "00", "status": "Valid", "error": "", "invoiceStatuses": [{"itemSNo": "1", "statusCode": "00", "status": "Valid", "invoiceNo": "3520223926179DIABBBOM380503-1", "errorCode": "", "error": ""}]}}'::jsonb,
      false,
      NOW(),
      NOW()
    ) RETURNING id INTO v_invoice_id;
    
    -- Insert the invoice item
    INSERT INTO invoice_items (
      id,
      invoice_id,
      hs_code_id,
      product_description,
      rate,
      unit_of_measurement,
      quantity,
      total_values,
      value_sales_excluding_st,
      fixed_notified_value_or_retail_price,
      sales_tax_applicable,
      sales_tax_withheld_at_source,
      extra_tax,
      further_tax,
      sro_schedule_no,
      fed_payable,
      discount,
      sale_type,
      sro_item_serial_no,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_invoice_id,
      'edd7e7f6-a4fd-4e19-b42a-ea5f68486264',
      'KHAKI',
      '18%',
      'KG',
      7.32,
      10448.90,
      8855.00,
      115.00,
      1593.90,
      0.00,
      '0',
      0.00,
      '',
      0.00,
      0.00,
      'Goods at standard rate (default)',
      '',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Invoice inserted successfully with ID: %', v_invoice_id;
  ELSE
    RAISE NOTICE 'Invoice already exists with ID: %', v_invoice_id;
  END IF;
END $$;
