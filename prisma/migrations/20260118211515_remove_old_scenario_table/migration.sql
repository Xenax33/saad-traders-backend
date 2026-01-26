-- DropForeignKey - Remove invoice foreign key to old scenarios table
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_scenario_id_fkey";

-- DropForeignKey - Remove scenarios foreign key to users
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_user_id_fkey";

-- DropTable
DROP TABLE "scenarios";

-- AddForeignKey - Add invoice foreign key to global_scenarios table
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "global_scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
