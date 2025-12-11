import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BarbershopModule } from "./modules/barbershop/barbershop.module";
import { UserProfilesModule } from "./modules/user-profiles/user-profiles.module";
import { AgendaModule } from "./modules/agenda/agenda.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ServicesModule } from "./modules/services/services.module";
import { FinanceModule } from "./modules/finance/finance.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>("REDIS_URL") ?? "redis://localhost:6379";
        const prefix = config.get<string>("BULLMQ_PREFIX") ?? "devnex-agenda";
        return {
          connection: { url },
          prefix,
        };
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    BarbershopModule,
    UserProfilesModule,
    AgendaModule,
    AppointmentsModule,
    ServicesModule,
    FinanceModule,
    NotificationsModule,
  ],
})
export class AppModule {}
