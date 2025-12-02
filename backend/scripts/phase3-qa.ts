import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AddressInfo } from "net";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

type HttpMethod = "GET" | "POST" | "PATCH";

type CallResult = {
  step: string;
  method: HttpMethod;
  url: string;
  status: number;
  response: unknown;
};

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    permissions: string[];
    barbershop: { id: string; name: string } | null;
  };
}

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

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const server = await app.listen(0);
  const address = server.address() as AddressInfo;
  const baseURL = `http://127.0.0.1:${address.port}/api/v1`;

  const results: CallResult[] = [];

  try {
    const timestamp = Date.now();
    const adminEmail = `qa.admin+${timestamp}@example.com`;
    const adminPassword = "Admin123!";

    // Signup admin
    const signupRes = await fetch(`${baseURL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        name: "QA Admin",
        phone: "+5511999999999",
      }),
    });
    const signupJson = (await signupRes.json()) as AuthResponse;
    results.push({
      step: "signup-admin",
      method: "POST",
      url: "/auth/signup",
      status: signupRes.status,
      response: {
        user: signupJson.user,
      },
    });

    if (signupRes.status >= 400) {
      throw new Error(`Admin signup failed with status ${signupRes.status}`);
    }

    const adminToken = signupJson.accessToken;
    const barbershopId = signupJson.user.barbershop?.id;
    if (!barbershopId) {
      throw new Error("Admin signup did not return barbershop data");
    }

    // Step 1: GET /barbershop/me
    const barbershopRes = await fetch(`${baseURL}/barbershop/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const barbershopJson = await barbershopRes.json();
    results.push({
      step: "barbershop-get",
      method: "GET",
      url: "/barbershop/me",
      status: barbershopRes.status,
      response: barbershopJson,
    });

    // Step 2: PATCH /barbershop/me
    const updatePayload = {
      phone: "+5511988887777",
      address: "Rua QA, 123",
      opensAt: "08:00",
    };
    const barbershopPatchRes = await fetch(`${baseURL}/barbershop/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });
    const barbershopPatchJson = await barbershopPatchRes.json();
    results.push({
      step: "barbershop-patch",
      method: "PATCH",
      url: "/barbershop/me",
      status: barbershopPatchRes.status,
      response: barbershopPatchJson,
    });

    // Step 3: Create barber profile
    const barberEmail = `qa.barber+${timestamp}@example.com`;
    const barberPassword = "Barber123!";
    const createBarberRes = await fetch(`${baseURL}/users/barbers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: barberEmail,
        password: barberPassword,
        name: "QA Barber",
        phone: "+5511987654321",
        bio: "Especialista em QA",
        commissionPercentage: 10,
      }),
    });
    const createBarberJson = await createBarberRes.json();
    results.push({
      step: "barber-create",
      method: "POST",
      url: "/users/barbers",
      status: createBarberRes.status,
      response: createBarberJson,
    });

    if (createBarberRes.status >= 400) {
      throw new Error(
        `Barber creation failed (status ${createBarberRes.status})`
      );
    }

    // Login as barber for negative test
    const barberLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: barberEmail, password: barberPassword }),
    });
    const barberLoginJson = (await barberLoginRes.json()) as AuthResponse;
    results.push({
      step: "barber-login",
      method: "POST",
      url: "/auth/login",
      status: barberLoginRes.status,
      response: {
        user: barberLoginJson.user,
      },
    });

    const barberToken = barberLoginJson.accessToken;

    // Negative test: barber updating barbershop
    const barberPatchRes = await fetch(`${baseURL}/barbershop/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${barberToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: "+551100000000" }),
    });
    const barberPatchJson = await barberPatchRes.json();
    results.push({
      step: "barbershop-patch-barber-deny",
      method: "PATCH",
      url: "/barbershop/me",
      status: barberPatchRes.status,
      response: barberPatchJson,
    });

    // Step 4: Create receptionist
    const receptionistEmail = `qa.reception+${timestamp}@example.com`;
    const receptionistPassword = "Reception123!";
    const createReceptionRes = await fetch(`${baseURL}/users/receptionists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: receptionistEmail,
        password: receptionistPassword,
        name: "QA Reception",
        phone: "+5511977776666",
      }),
    });
    const createReceptionJson = await createReceptionRes.json();
    results.push({
      step: "receptionist-create",
      method: "POST",
      url: "/users/receptionists",
      status: createReceptionRes.status,
      response: createReceptionJson,
    });

    if (createReceptionRes.status >= 400) {
      throw new Error(
        `Receptionist creation failed (status ${createReceptionRes.status})`
      );
    }

    // Create customer directly for tenant isolation test
    const customer = await prisma.customerProfile.create({
      data: {
        barbershopId,
        name: "Cliente QA",
        phone: "+5511966665555",
        avatarUrl: null,
      },
    });

    // Step 5: GET customer by id
    const customerRes = await fetch(
      `${baseURL}/users/customers/${customer.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    const customerJson = await customerRes.json();
    results.push({
      step: "customer-get",
      method: "GET",
      url: `/users/customers/${customer.id}`,
      status: customerRes.status,
      response: customerJson,
    });

    // Optional: ensure different tenant blocked – create second admin/customer
    const otherAdminEmail = `qa.admin.other+${timestamp}@example.com`;
    const otherAdminPassword = "Admin456!";
    const otherSignupRes = await fetch(`${baseURL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: otherAdminEmail,
        password: otherAdminPassword,
        name: "QA Admin 2",
      }),
    });
    const otherSignupJson = (await otherSignupRes.json()) as AuthResponse;
    results.push({
      step: "signup-admin-2",
      method: "POST",
      url: "/auth/signup",
      status: otherSignupRes.status,
      response: {
        user: otherSignupJson.user,
      },
    });

    if (otherSignupRes.status < 400) {
      const otherToken = otherSignupJson.accessToken;
      const crossTenantRes = await fetch(
        `${baseURL}/users/customers/${customer.id}`,
        {
          headers: { Authorization: `Bearer ${otherToken}` },
        }
      );
      let crossTenantJson: unknown = null;
      try {
        crossTenantJson = await crossTenantRes.json();
      } catch (err) {
        crossTenantJson = { error: "non-json response" };
      }
      results.push({
        step: "customer-cross-tenant-deny",
        method: "GET",
        url: `/users/customers/${customer.id}`,
        status: crossTenantRes.status,
        response: crossTenantJson,
      });
    }
  } finally {
    await app.close();
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error("QA script failed", error);
  process.exitCode = 1;
});
