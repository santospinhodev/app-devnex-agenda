import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BarbershopModule } from "./modules/barbershop/barbershop.module";
import { UserProfilesModule } from "./modules/user-profiles/user-profiles.module";
import { AgendaModule } from "./modules/agenda/agenda.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    BarbershopModule,
    UserProfilesModule,
    AgendaModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
