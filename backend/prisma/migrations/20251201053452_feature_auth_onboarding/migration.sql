/*
  Warnings:

  - Added the required column `barbershopId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barbershopId` to the `barber_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barbershopId` to the `customer_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barbershopId` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "barber_profiles" ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customer_profiles" ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "barbershops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "barbershops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barbershops_ownerId_idx" ON "barbershops"("ownerId");

-- CreateIndex
CREATE INDEX "appointments_barbershopId_startAt_idx" ON "appointments"("barbershopId", "startAt");

-- CreateIndex
CREATE INDEX "barber_profiles_barbershopId_idx" ON "barber_profiles"("barbershopId");

-- CreateIndex
CREATE INDEX "customer_profiles_barbershopId_idx" ON "customer_profiles"("barbershopId");

-- CreateIndex
CREATE INDEX "services_barbershopId_idx" ON "services"("barbershopId");

-- AddForeignKey
ALTER TABLE "barbershops" ADD CONSTRAINT "barbershops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_profiles" ADD CONSTRAINT "barber_profiles_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
