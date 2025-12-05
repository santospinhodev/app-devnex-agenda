import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CashFlowType,
  CommissionStatus,
  PaymentMethod,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import {
  BarbershopService,
  RequestActor as BarbershopRequestActor,
} from "../../barbershop/services/barbershop.service";
import { Permission } from "../../../common/enums/permission.enum";
import { AppointmentWithRelations } from "../../appointments/repositories/appointments.repository";
import { FinishPaymentMethod } from "../../appointments/dto/finish-appointment.dto";

interface RecordIncomeParams {
  appointment: AppointmentWithRelations;
  paymentMethod: FinishPaymentMethod;
}

export interface DailyCashTransaction {
  id: string;
  appointmentId: string | null;
  type: CashFlowType;
  amount: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface DailyCashSummary {
  date: string;
  totalIncome: string;
  totalExpense: string;
  netTotal: string;
  transactions: DailyCashTransaction[];
}

export interface BarberBalanceSummary {
  pendingTotal: string;
  paidTotal: string;
  commissions: Array<{
    id: string;
    appointmentId: string;
    status: CommissionStatus;
    amount: string;
    serviceName: string | null;
    performedAt: string | null;
    createdAt: string;
  }>;
}

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly barbershopService: BarbershopService,
  ) {}

  async recordIncome(
    tx: Prisma.TransactionClient,
    params: RecordIncomeParams,
  ): Promise<void> {
    const paymentMethod = this.mapPaymentMethod(params.paymentMethod);
    const price = new Prisma.Decimal(params.appointment.price);
    const commissionPercentage =
      params.appointment.barber.barberProfile?.commissionPercentage ?? 50;
    const commissionAmount = price
      .mul(new Prisma.Decimal(commissionPercentage))
      .div(100);

    await tx.cashFlow.create({
      data: {
        barbershopId: params.appointment.barbershopId,
        appointmentId: params.appointment.id,
        type: CashFlowType.INCOME,
        paymentMethod,
        amount: price,
        description: `Atendimento ${params.appointment.service.name}`,
      },
    });

    await tx.commission.create({
      data: {
        appointmentId: params.appointment.id,
        barberId: params.appointment.barberId,
        barbershopId: params.appointment.barbershopId,
        amount: commissionAmount,
        status: CommissionStatus.PENDING,
      },
    });
  }

  async getDailyCashSummary(
    actor: BarbershopRequestActor,
    date?: string,
  ): Promise<DailyCashSummary> {
    const barbershop =
      await this.barbershopService.getBarbershopForActor(actor);

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for this user");
    }

    const { start, end, label } = this.resolveDateRange(date);

    const transactions = await this.prisma.cashFlow.findMany({
      where: {
        barbershopId: barbershop.id,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const incomeTotal = this.sumAmounts(
      transactions.filter((entry) => entry.type === CashFlowType.INCOME),
    );
    const expenseTotal = this.sumAmounts(
      transactions.filter((entry) => entry.type === CashFlowType.EXPENSE),
    );
    const net = incomeTotal.sub(expenseTotal);

    return {
      date: label,
      totalIncome: incomeTotal.toString(),
      totalExpense: expenseTotal.toString(),
      netTotal: net.toString(),
      transactions: transactions.map((entry) => ({
        id: entry.id,
        appointmentId: entry.appointmentId,
        type: entry.type,
        amount: entry.amount.toString(),
        paymentMethod: entry.paymentMethod,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  async getBarberBalance(
    actor: BarbershopRequestActor,
  ): Promise<BarberBalanceSummary> {
    const permissions = new Set(actor.permissions);
    if (!permissions.has(Permission.BARBER)) {
      throw new ForbiddenException("Only barbers can access this summary");
    }

    const commissions = await this.prisma.commission.findMany({
      where: { barberId: actor.userId },
      include: {
        appointment: {
          select: {
            id: true,
            startAt: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pending = this.sumAmounts(
      commissions.filter((entry) => entry.status === CommissionStatus.PENDING),
    );
    const paid = this.sumAmounts(
      commissions.filter((entry) => entry.status === CommissionStatus.PAID),
    );

    return {
      pendingTotal: pending.toString(),
      paidTotal: paid.toString(),
      commissions: commissions.map((entry) => ({
        id: entry.id,
        appointmentId: entry.appointmentId,
        status: entry.status,
        amount: entry.amount.toString(),
        serviceName: entry.appointment?.service?.name ?? null,
        performedAt: entry.appointment?.startAt?.toISOString() ?? null,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  private mapPaymentMethod(method: FinishPaymentMethod): PaymentMethod {
    switch (method) {
      case FinishPaymentMethod.CARD:
        return PaymentMethod.CARD;
      case FinishPaymentMethod.PIX:
        return PaymentMethod.PIX;
      default:
        return PaymentMethod.CASH;
    }
  }

  private resolveDateRange(date?: string) {
    const target = date ? new Date(date) : new Date();
    if (Number.isNaN(target.getTime())) {
      throw new BadRequestException("Invalid date parameter");
    }
    const start = new Date(
      Date.UTC(
        target.getUTCFullYear(),
        target.getUTCMonth(),
        target.getUTCDate(),
      ),
    );
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const label = start.toISOString().slice(0, 10);
    return { start, end, label };
  }

  private sumAmounts(records: { amount: Prisma.Decimal }[]) {
    return records.reduce(
      (acc, entry) => acc.add(entry.amount),
      new Prisma.Decimal(0),
    );
  }
}
