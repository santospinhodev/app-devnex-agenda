import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    const shutdown = async (): Promise<void> => {
      await app.close();
    };

    process.once("beforeExit", shutdown);
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    process.once("SIGUSR2", shutdown);
  }
}
