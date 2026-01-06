/*
  Warnings:

  - Added the required column `type` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "job" ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "job_type_idx" ON "job"("type");

-- CreateIndex
CREATE INDEX "job_userId_type_idx" ON "job"("userId", "type");
