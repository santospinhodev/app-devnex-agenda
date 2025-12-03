-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('MANUAL', 'BREAK', 'VACATION', 'SICK_LEAVE', 'OTHER');

-- CreateTable
CREATE TABLE "barber_blocks" (
    "id" TEXT NOT NULL,
    "barberProfileId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "BlockType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barber_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barber_blocks_barberProfileId_startTime_idx" ON "barber_blocks"("barberProfileId", "startTime");

-- CreateIndex
CREATE INDEX "barber_blocks_barbershopId_startTime_idx" ON "barber_blocks"("barbershopId", "startTime");

-- AddForeignKey
ALTER TABLE "barber_blocks" ADD CONSTRAINT "barber_blocks_barberProfileId_fkey" FOREIGN KEY ("barberProfileId") REFERENCES "barber_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_blocks" ADD CONSTRAINT "barber_blocks_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
