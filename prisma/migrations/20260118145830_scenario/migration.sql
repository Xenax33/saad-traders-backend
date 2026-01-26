-- CreateTable
CREATE TABLE "user_scenarios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_scenarios_user_id_scenario_id_key" ON "user_scenarios"("user_id", "scenario_id");

-- AddForeignKey
ALTER TABLE "user_scenarios" ADD CONSTRAINT "user_scenarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scenarios" ADD CONSTRAINT "user_scenarios_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "global_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
