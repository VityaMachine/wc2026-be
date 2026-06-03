/*
  Warnings:

  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

-- Remove the temporary default after adding required columns.
ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;
