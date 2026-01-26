-- CreateTable
CREATE TABLE "global_scenarios" (
    "id" TEXT NOT NULL,
    "scenario_code" TEXT NOT NULL,
    "scenario_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_scenarios_scenario_code_key" ON "global_scenarios"("scenario_code");
