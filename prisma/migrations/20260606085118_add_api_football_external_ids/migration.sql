/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");
