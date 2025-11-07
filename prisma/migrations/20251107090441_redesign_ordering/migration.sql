/*
  Warnings:

  - You are about to drop the column `bookmarkOrder` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `launcherTopLevelOrdering` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `topLevelOrdering` on the `settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pinnedCollectionId]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('collection', 'bookmark');

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "bookmarkOrder",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "launcherTopLevelOrdering",
DROP COLUMN "topLevelOrdering";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "order" JSONB NOT NULL,
    "collectionId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_type_collectionId_key" ON "Order"("userId", "type", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_orderId_key" ON "Collection"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_pinnedCollectionId_key" ON "settings"("pinnedCollectionId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
