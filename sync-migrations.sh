#!/bin/bash
# Script to sync all migrations to production database

echo "Syncing migrations to production database..."

# Mark existing migrations as applied (baseline)
echo "Marking old migrations as applied..."
npx prisma migrate resolve --applied "20260113205603_init"
npx prisma migrate resolve --applied "20260117101937_refactor_invoice_with_relations"
npx prisma migrate resolve --applied "20260117132528_add_transaction_types"
npx prisma migrate resolve --applied "20260117134856_remove_transaction_type_from_items"
npx prisma migrate resolve --applied "20260117135210_drop_transaction_types_table"
npx prisma migrate resolve --applied "20260117135657_add_global_scenarios"
npx prisma migrate resolve --applied "20260118145830_scenario"
npx prisma migrate resolve --applied "20260118163138_add_sales_type_to_global_scenarios"
npx prisma migrate resolve --applied "20260118211515_remove_old_scenario_table"
npx prisma migrate resolve --applied "20260124_add_fbr_id_to_global_scenarios"
npx prisma migrate resolve --applied "20260124_allow_duplicate_fbr_id"
npx prisma migrate resolve --applied "20260125_add_mfa_fields"

echo "Deploying pending migrations..."
# This will now only deploy the new migration
npx prisma migrate deploy

echo "Regenerating Prisma Client..."
npx prisma generate

echo "Done! Restarting server..."
pm2 restart fbr-invoice-backend

echo "✅ All migrations synced successfully!"
