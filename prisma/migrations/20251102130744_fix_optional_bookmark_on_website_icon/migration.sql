/*
  Warnings:

  - You are about to drop the column `websiteIconId` on the `Bookmark` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookmarkId]` on the table `WebsiteIcon` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookmarkId` to the `WebsiteIcon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `WebsiteIcon` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `data` on the `WebsiteIcon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Bookmark" DROP CONSTRAINT "Bookmark_websiteIconId_fkey";

-- DropIndex
DROP INDEX "public"."Bookmark_websiteIconId_key";

-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "websiteIconId";

-- AlterTable
ALTER TABLE "WebsiteIcon" ADD COLUMN     "bookmarkId" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
DROP COLUMN "data",
ADD COLUMN     "data" BYTEA NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteIcon_bookmarkId_key" ON "WebsiteIcon"("bookmarkId");

-- AddForeignKey
ALTER TABLE "WebsiteIcon" ADD CONSTRAINT "WebsiteIcon_bookmarkId_fkey" FOREIGN KEY ("bookmarkId") REFERENCES "Bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;
