-- Check if user exists
SELECT id, name, email, business_name FROM users WHERE id = '0b4c0575-ad97-4ac3-bb39-af7d2c66959c';

-- Check if buyer exists
SELECT id, business_name, ntn_cnic FROM buyers WHERE id = '80d0b517-befe-4af1-8daa-f0431554dbec';

-- Check if hs_code exists
SELECT id, hs_code, description FROM hs_codes WHERE id = 'edd7e7f6-a4fd-4e19-b42a-ea5f68486264';
