import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  checkHealth(): { status: string; service: string } {
    return { status: "ok", service: "Core API" };
  }
}
