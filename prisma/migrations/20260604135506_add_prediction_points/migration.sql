/*
  Warnings:

  - You are about to alter the column `points` on the `Prediction` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "calculatedAt" TIMESTAMP(3),
ALTER COLUMN "points" SET DATA TYPE DECIMAL(5,2);
