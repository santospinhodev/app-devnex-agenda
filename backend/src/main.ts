import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { PrismaService } from "./database/prisma.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await prismaService.enableShutdownHooks(app);

  const port = configService.get<number>("APP_PORT", 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[Core API] Server running on port ${port}`);
}

void bootstrap();
