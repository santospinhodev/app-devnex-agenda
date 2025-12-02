import { Prisma } from "@prisma/client";

export const barberProfileWithUser =
  Prisma.validator<Prisma.BarberProfileDefaultArgs>()({
    include: {
      user: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      barbershop: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

export type BarberProfileWithUser = Prisma.BarberProfileGetPayload<
  typeof barberProfileWithUser
>;

export const receptionistProfileWithUser =
  Prisma.validator<Prisma.ReceptionistProfileDefaultArgs>()({
    include: {
      user: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      barbershop: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

export type ReceptionistProfileWithUser = Prisma.ReceptionistProfileGetPayload<
  typeof receptionistProfileWithUser
>;

export const customerProfileWithBarbershop =
  Prisma.validator<Prisma.CustomerProfileDefaultArgs>()({
    include: {
      barbershop: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

export type CustomerProfileWithBarbershop = Prisma.CustomerProfileGetPayload<
  typeof customerProfileWithBarbershop
>;
