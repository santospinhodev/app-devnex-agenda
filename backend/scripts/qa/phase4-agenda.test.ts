import "dotenv/config";
import { AddressInfo } from "net";
import { DateTime } from "luxon";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/database/prisma.service";
import { FinalTimelineEntry } from "../../src/modules/agenda/types/agenda.types";

const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

type HttpMethod = "GET" | "POST" | "PATCH";

type HttpResponse<T> = {
  status: number;
  data: T | null;
  headers: Headers;
};

type HttpOptions = {
  body?: unknown;
  token?: string;
};

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const server = await app.listen(0);
  const address = server.address() as AddressInfo;
  const baseURL = `http://127.0.0.1:${address.port}/api/v1`;

  const request = async <T>(
    method: HttpMethod,
    path: string,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> => {
    const headers: Record<string, string> = {};
    if (options.body) {
      headers["Content-Type"] = "application/json";
    }
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${baseURL}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data: T | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as unknown as T;
      }
    }

    return { status: response.status, data, headers: response.headers };
  };

  try {
    const timestamp = Date.now();
    const adminEmail = `phase4.admin+${timestamp}@example.com`;
    const adminPassword = "Admin123!";

    const signupRes = await request<any>("POST", "/auth/signup", {
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "QA Phase4 Admin",
        phone: "+5511999999999",
      },
    });
    if (!signupRes.data || signupRes.status >= 400) {
      throw new Error(`Admin signup failed (${signupRes.status})`);
    }

    const loginRes = await request<any>("POST", "/auth/login", {
      body: {
        email: adminEmail,
        password: adminPassword,
      },
    });
    if (!loginRes.data || loginRes.status >= 400) {
      throw new Error(`Admin login failed (${loginRes.status})`);
    }

    const adminToken: string | undefined = loginRes.data.accessToken;
    if (!adminToken) {
      throw new Error("Login response missing access token");
    }

    const barbershopId: string | undefined =
      loginRes.data.user?.barbershop?.id ?? signupRes.data.user?.barbershop?.id;
    if (!barbershopId) {
      throw new Error("Barbershop id not returned in auth responses");
    }

    const barbershopRes = await request<any>("PATCH", "/barbershop/me", {
      token: adminToken,
      body: {
        opensAt: "08:00",
        closesAt: "18:00",
        phone: "+5511988887777",
      },
    });
    if (barbershopRes.status >= 400) {
      throw new Error(
        `Failed to configure barbershop (${barbershopRes.status})`
      );
    }

    const barberEmail = `phase4.barber+${timestamp}@example.com`;
    const barberPassword = "Barber123!";
    const barberRes = await request<any>("POST", "/users/barbers", {
      token: adminToken,
      body: {
        email: barberEmail,
        password: barberPassword,
        name: "QA Barber",
        phone: "+5511987654321",
        bio: "Phase4 QA Barber",
        commissionPercentage: 10,
      },
    });
    if (!barberRes.data || barberRes.status >= 400) {
      throw new Error(`Failed to create barber (${barberRes.status})`);
    }

    const barberId: string | undefined = barberRes.data.id;
    if (!barberId) {
      throw new Error("Barber creation did not return id");
    }

    const timezone = "America/Sao_Paulo";
    const targetDate = DateTime.now()
      .setZone(timezone)
      .plus({ days: 1 })
      .startOf("day");
    const dayOfWeek = targetDate.weekday % 7;

    const availabilityRes = await request<any>(
      "POST",
      `/agenda/barber/${barberId}/availability`,
      {
        token: adminToken,
        body: {
          rules: [
            {
              dayOfWeek,
              startTime: "09:00",
              endTime: "12:00",
              slotInterval: 30,
            },
          ],
        },
      }
    );
    if (availabilityRes.status >= 400) {
      throw new Error(
        `Failed to upsert availability (${availabilityRes.status})`
      );
    }

    const blockStart = targetDate.set({ hour: 10, minute: 0 }).toUTC().toISO();
    const blockEnd = targetDate.set({ hour: 10, minute: 30 }).toUTC().toISO();
    if (!blockStart || !blockEnd) {
      throw new Error("Unable to generate block ISO dates");
    }

    const blockPayload = {
      startTime: blockStart,
      endTime: blockEnd,
      type: "MANUAL",
      note: "QA Block Window",
    };

    const blockRes = await request<any>(
      "POST",
      `/agenda/barber/${barberId}/blocks`,
      {
        token: adminToken,
        body: blockPayload,
      }
    );
    if (blockRes.status >= 400) {
      throw new Error(`Failed to create block (${blockRes.status})`);
    }

    const finalDayRes = await request<FinalTimelineEntry[]>(
      "GET",
      `/agenda/barber/${barberId}/final/day?date=${targetDate.toISODate()}`,
      { token: adminToken }
    );
    if (finalDayRes.status !== 200 || !Array.isArray(finalDayRes.data)) {
      throw new Error(`Final day timeline failed (${finalDayRes.status})`);
    }

    const generatedAtHeader = finalDayRes.headers.get("x-generated-at");
    if (!generatedAtHeader) {
      throw new Error("Missing X-Generated-At header");
    }

    const slotMap = new Map<string, FinalTimelineEntry>();
    finalDayRes.data.forEach((entry) => slotMap.set(entry.time, entry));

    if (slotMap.get("09:00")?.status !== "FREE") {
      throw new Error("09:00 slot is not FREE");
    }
    if (slotMap.get("10:00")?.status !== "BLOCKED") {
      throw new Error("10:00 slot is not BLOCKED");
    }
    if (slotMap.get("13:00")?.status !== "UNAVAILABLE") {
      throw new Error("13:00 slot is not UNAVAILABLE");
    }

    const receptionistEmail = `phase4.reception+${timestamp}@example.com`;
    const receptionistPassword = "Reception123!";
    const receptionistRes = await request<any>("POST", "/users/receptionists", {
      token: adminToken,
      body: {
        email: receptionistEmail,
        password: receptionistPassword,
        name: "QA Reception",
        phone: "+5511977776666",
      },
    });
    if (receptionistRes.status >= 400) {
      throw new Error(
        `Failed to create receptionist (${receptionistRes.status})`
      );
    }

    const receptionLoginRes = await request<any>("POST", "/auth/login", {
      body: {
        email: receptionistEmail,
        password: receptionistPassword,
      },
    });
    if (!receptionLoginRes.data || receptionLoginRes.status >= 400) {
      throw new Error(
        `Receptionist login failed (${receptionLoginRes.status})`
      );
    }

    const receptionistToken: string | undefined =
      receptionLoginRes.data.accessToken;
    if (!receptionistToken) {
      throw new Error("Receptionist login missing access token");
    }

    const forbiddenRes = await request<any>(
      "POST",
      `/agenda/barber/${barberId}/blocks`,
      {
        token: receptionistToken,
        body: blockPayload,
      }
    );
    if (forbiddenRes.status !== 403) {
      throw new Error(
        `Expected 403 when receptionist creates block, got ${forbiddenRes.status}`
      );
    }

    console.log(`${COLORS.green}PASS${COLORS.reset} Phase4 Agenda QA suite`);
  } catch (error) {
    console.error(
      `${COLORS.red}FAIL${COLORS.reset} Phase4 Agenda QA suite`,
      (error as Error).message
    );
    console.error((error as Error).stack);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
