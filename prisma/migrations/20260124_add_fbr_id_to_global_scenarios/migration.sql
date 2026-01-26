-- AddColumn - Add fbrId to global_scenarios table
ALTER TABLE "global_scenarios" ADD COLUMN "fbr_id" INTEGER;

-- Update existing records with unique sequential values using CTE
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num FROM "global_scenarios"
)
UPDATE "global_scenarios" SET "fbr_id" = numbered.row_num
FROM numbered WHERE "global_scenarios".id = numbered.id;

-- Set column to NOT NULL after updating existing records
ALTER TABLE "global_scenarios" ALTER COLUMN "fbr_id" SET NOT NULL;

-- Add unique constraint to fbr_id
ALTER TABLE "global_scenarios" ADD CONSTRAINT "global_scenarios_fbr_id_key" UNIQUE ("fbr_id");
