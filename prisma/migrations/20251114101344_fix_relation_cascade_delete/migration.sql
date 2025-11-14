/*
  Warnings:

  - You are about to drop the column `websiteIconId` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Collection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[collectionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Bookmark" DROP CONSTRAINT "Bookmark_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Collection" DROP CONSTRAINT "Collection_orderId_fkey";

-- DropIndex
DROP INDEX "public"."Collection_orderId_key";

-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "websiteIconId";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "orderId";

-- CreateIndex
CREATE UNIQUE INDEX "Order_collectionId_key" ON "Order"("collectionId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
