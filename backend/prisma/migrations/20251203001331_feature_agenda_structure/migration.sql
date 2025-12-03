-- CreateTable
CREATE TABLE "barber_availabilities" (
    "id" TEXT NOT NULL,
    "barberProfileId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "lunchStart" TEXT,
    "lunchEnd" TEXT,
    "slotInterval" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barber_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barber_availabilities_barberProfileId_dayOfWeek_idx" ON "barber_availabilities"("barberProfileId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "barber_availabilities_barberProfileId_dayOfWeek_key" ON "barber_availabilities"("barberProfileId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "barber_availabilities" ADD CONSTRAINT "barber_availabilities_barberProfileId_fkey" FOREIGN KEY ("barberProfileId") REFERENCES "barber_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
