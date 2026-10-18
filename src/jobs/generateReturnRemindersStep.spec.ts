import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Knex } from "knex";
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

describe("generateReturnRemindersStep", () => {
	let connection: Knex;
	const save = vi.fn();

	beforeEach(async () => {
		connection = {} as Knex;
		save.mockReset();

		const { PostgresMessageTemplatesRepository } = await import(
			"@/repositories/implementations/PostgresMessageTemplatesRepository"
		);
		const { PostgresReturnRemindersRepository } = await import(
			"@/repositories/implementations/PostgresReturnRemindersRepository"
		);
		const { PostgresMessagesRepository } = await import(
			"@/repositories/implementations/PostgresMessagesRepository"
		);
		const { PostgresCustomersRepository } = await import(
			"@/repositories/implementations/PostgresCustomersRepository"
		);
		const { PostgresAppointmentsRepository } = await import(
			"@/repositories/implementations/PostgresAppointmentsRepository"
		);
		const { PostgresCustomerRewardsRepository } = await import(
			"@/repositories/implementations/PostgresCustomerRewardsRepository"
		);

		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			() =>
				({
					findActiveAutomaticByType: vi.fn().mockResolvedValue(null),
				}) as never,
		);

		vi.mocked(PostgresReturnRemindersRepository).mockImplementation(
			() =>
				({
					listEligibleForReminders: vi.fn(),
				}) as never,
		);

		vi.mocked(PostgresMessagesRepository).mockImplementation(
			() => ({ save }) as never,
		);

		vi.mocked(PostgresCustomersRepository).mockImplementation(
			() => ({}) as never,
		);
		vi.mocked(PostgresAppointmentsRepository).mockImplementation(
			() => ({}) as never,
		);
		vi.mocked(PostgresCustomerRewardsRepository).mockImplementation(
			() =>
				({
					findSoonestExpiringAvailable: vi.fn().mockResolvedValue(null),
				}) as never,
		);
	});

	it("não gera lembretes quando não há modelo ativo", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const result = await generateReturnRemindersStep(connection, referenceDate);

		expect(result.generatedCount).toBe(0);
		expect(result.skippedNoActiveTemplate).toBe(true);
		expect(save).not.toHaveBeenCalled();
	});

	it("usa o limite de 30 dias de atraso na seleção", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const { PostgresMessageTemplatesRepository } = await import(
			"@/repositories/implementations/PostgresMessageTemplatesRepository"
		);
		const { PostgresReturnRemindersRepository } = await import(
			"@/repositories/implementations/PostgresReturnRemindersRepository"
		);

		const listEligibleForReminders = vi.fn().mockResolvedValue([]);
		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			() =>
				({
					findActiveAutomaticByType: vi.fn().mockResolvedValue({
						id: "template-1",
						content: "Oi {nome}!",
					}),
				}) as never,
		);
		vi.mocked(PostgresReturnRemindersRepository).mockImplementation(
			() => ({ listEligibleForReminders }) as never,
		);

		await generateReturnRemindersStep(connection, referenceDate);

		expect(listEligibleForReminders).toHaveBeenCalledWith(
			"2026-10-17",
			RETURN_REMINDER_MAX_OVERDUE_DAYS,
		);
	});
});
