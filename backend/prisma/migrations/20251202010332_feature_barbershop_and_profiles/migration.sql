/*
  Warnings:

  - You are about to drop the column `commissionPct` on the `barber_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `barber_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `birthdate` on the `customer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `customer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `customer_profiles` table. All the data in the column will be lost.
  - Added the required column `name` to the `barber_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `customer_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `customer_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customer_profiles" DROP CONSTRAINT "customer_profiles_userId_fkey";

-- DropIndex
DROP INDEX "customer_profiles_userId_key";

-- AlterTable
ALTER TABLE "barber_profiles" DROP COLUMN "commissionPct",
DROP COLUMN "specialties",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "commissionPercentage" DOUBLE PRECISION,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "barbershops" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "closesAt" TEXT,
ADD COLUMN     "daysOpen" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "opensAt" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "customer_profiles" DROP COLUMN "birthdate",
DROP COLUMN "metadata",
DROP COLUMN "userId",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "receptionist_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receptionist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receptionist_profiles_userId_key" ON "receptionist_profiles"("userId");

-- CreateIndex
CREATE INDEX "receptionist_profiles_barbershopId_idx" ON "receptionist_profiles"("barbershopId");

-- AddForeignKey
ALTER TABLE "receptionist_profiles" ADD CONSTRAINT "receptionist_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receptionist_profiles" ADD CONSTRAINT "receptionist_profiles_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
