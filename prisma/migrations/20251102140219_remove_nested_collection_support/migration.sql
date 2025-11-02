/*
  Warnings:

  - You are about to drop the column `parentId` on the `Collection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Collection" DROP CONSTRAINT "Collection_parentId_fkey";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "parentId";
