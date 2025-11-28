-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('desktop', 'mobile', 'all');

-- CreateTable
CREATE TABLE "BackgroundImage" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filename" TEXT,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'all',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "displaySize" TEXT NOT NULL DEFAULT 'cover',
    "displayPosition" TEXT NOT NULL DEFAULT 'center',
    "displayRepeat" TEXT NOT NULL DEFAULT 'no-repeat',
    "displayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "displayBlur" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BackgroundImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BackgroundImage" ADD CONSTRAINT "BackgroundImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
