import { Prisma } from "@prisma/client";

export const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    permissions: {
      include: {
        permission: true,
      },
    },
    barberProfile: {
      include: {
        barbershop: true,
      },
    },
    customerProfile: {
      include: {
        barbershop: true,
      },
    },
  },
});

export type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelations>;
