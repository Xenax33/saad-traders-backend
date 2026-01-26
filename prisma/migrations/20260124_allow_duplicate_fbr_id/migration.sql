-- Allow duplicate fbr_id values on global_scenarios
ALTER TABLE "global_scenarios" DROP CONSTRAINT IF EXISTS "global_scenarios_fbr_id_key";
