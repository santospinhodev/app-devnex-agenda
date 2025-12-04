import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BarbershopModule } from "./modules/barbershop/barbershop.module";
import { UserProfilesModule } from "./modules/user-profiles/user-profiles.module";
import { AgendaModule } from "./modules/agenda/agenda.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    BarbershopModule,
    UserProfilesModule,
    AgendaModule,
    AppointmentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
