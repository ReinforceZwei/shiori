-- CreateEnum
CREATE TYPE "LayoutMode" AS ENUM ('launcher', 'grid', 'list');

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layoutMode" "LayoutMode" NOT NULL DEFAULT 'launcher',
    "topLevelOrdering" JSONB,
    "launcherTopLevelOrdering" JSONB,
    "pinnedCollectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_pinnedCollectionId_fkey" FOREIGN KEY ("pinnedCollectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
