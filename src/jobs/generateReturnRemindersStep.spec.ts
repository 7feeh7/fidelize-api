// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new

import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tenant } from "@/entities/Tenant";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresReturnRemindersRepository } from "@/repositories/implementations/PostgresReturnRemindersRepository";
import {
	generateReturnRemindersStep,
	RETURN_REMINDER_MAX_OVERDUE_DAYS,
} from "./generateReturnRemindersStep";

vi.mock(
	"@/repositories/implementations/PostgresMessageTemplatesRepository",
	() => ({
		PostgresMessageTemplatesRepository: vi.fn(),
	}),
);

vi.mock(
	"@/repositories/implementations/PostgresReturnRemindersRepository",
	() => ({
		PostgresReturnRemindersRepository: vi.fn(),
	}),
);

vi.mock("@/repositories/implementations/PostgresMessagesRepository", () => ({
	PostgresMessagesRepository: vi.fn(),
}));

vi.mock("@/repositories/implementations/PostgresCustomersRepository", () => ({
	PostgresCustomersRepository: vi.fn(),
}));

vi.mock(
	"@/repositories/implementations/PostgresAppointmentsRepository",
	() => ({
		PostgresAppointmentsRepository: vi.fn(),
	}),
);

vi.mock(
	"@/repositories/implementations/PostgresCustomerRewardsRepository",
	() => ({
		PostgresCustomerRewardsRepository: vi.fn(),
	}),
);

const TENANT = new Tenant(
	{ name: "Salão Teste", slug: "salao-teste", status: "ACTIVE" },
	"tenant-1",
);

describe("generateReturnRemindersStep", () => {
	let connection: Knex;
	const saveIgnoringAppointmentItemConflict = vi.fn();

	beforeEach(() => {
		connection = {} as Knex;
		saveIgnoringAppointmentItemConflict.mockReset();
		saveIgnoringAppointmentItemConflict.mockResolvedValue(true);

		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			function () {
				return {
					findActiveAutomaticByType: vi.fn().mockResolvedValue(null),
				} as never;
			},
		);

		vi.mocked(PostgresReturnRemindersRepository).mockImplementation(
			function () {
				return {
					listEligibleForReminders: vi.fn(),
				} as never;
			},
		);

		vi.mocked(PostgresMessagesRepository).mockImplementation(function () {
			return { saveIgnoringAppointmentItemConflict } as never;
		});

		vi.mocked(PostgresCustomersRepository).mockImplementation(function () {
			return {} as never;
		});
		vi.mocked(PostgresAppointmentsRepository).mockImplementation(function () {
			return {} as never;
		});
		vi.mocked(PostgresCustomerRewardsRepository).mockImplementation(
			function () {
				return {
					findSoonestExpiringAvailable: vi.fn().mockResolvedValue(null),
				} as never;
			},
		);
	});

	it("não gera lembretes quando não há modelo ativo", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const result = await generateReturnRemindersStep(
			connection,
			TENANT,
			referenceDate,
		);

		expect(result.generatedCount).toBe(0);
		expect(result.skippedNoActiveTemplate).toBe(true);
		expect(saveIgnoringAppointmentItemConflict).not.toHaveBeenCalled();
	});

	it("usa o limite de 30 dias de atraso na seleção", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const listEligibleForReminders = vi.fn().mockResolvedValue([]);
		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			function () {
				return {
					findActiveAutomaticByType: vi.fn().mockResolvedValue({
						id: "template-1",
						content: "Oi {nome}!",
					}),
				} as never;
			},
		);
		vi.mocked(PostgresReturnRemindersRepository).mockImplementation(
			function () {
				return { listEligibleForReminders } as never;
			},
		);

		await generateReturnRemindersStep(connection, TENANT, referenceDate);

		expect(listEligibleForReminders).toHaveBeenCalledWith(
			"tenant-1",
			"2026-10-17",
			RETURN_REMINDER_MAX_OVERDUE_DAYS,
		);
	});

	it("gera a mensagem com o modelo e o nome do próprio negócio", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const findActiveAutomaticByType = vi.fn().mockResolvedValue({
			id: "template-1",
			content: "Oi {nome}, aqui é o {negocio}!",
		});
		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			function () {
				return { findActiveAutomaticByType } as never;
			},
		);
		vi.mocked(PostgresReturnRemindersRepository).mockImplementation(
			function () {
				return {
					listEligibleForReminders: vi.fn().mockResolvedValue([
						{
							appointmentItemId: "item-1",
							customerId: "customer-1",
							customerName: "Maria Silva",
							serviceName: "Corte",
							appointmentDate: "2026-09-01",
							returnDueDate: "2026-10-01",
						},
					]),
				} as never;
			},
		);

		const result = await generateReturnRemindersStep(
			connection,
			TENANT,
			referenceDate,
		);

		expect(result.generatedCount).toBe(1);
		expect(findActiveAutomaticByType).toHaveBeenCalledWith(
			"tenant-1",
			"RETURN_REMINDER",
		);

		const [tenantId, message] =
			saveIgnoringAppointmentItemConflict.mock.calls[0] ?? [];
		expect(tenantId).toBe("tenant-1");
		expect(message.content).toBe("Oi Maria, aqui é o Salão Teste!");
	});
});
