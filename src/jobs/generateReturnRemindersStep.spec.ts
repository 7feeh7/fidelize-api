// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new

import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("generateReturnRemindersStep", () => {
	let connection: Knex;
	const save = vi.fn();

	beforeEach(() => {
		connection = {} as Knex;
		save.mockReset();

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
			return { save } as never;
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
		const result = await generateReturnRemindersStep(connection, referenceDate);

		expect(result.generatedCount).toBe(0);
		expect(result.skippedNoActiveTemplate).toBe(true);
		expect(save).not.toHaveBeenCalled();
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

		await generateReturnRemindersStep(connection, referenceDate);

		expect(listEligibleForReminders).toHaveBeenCalledWith(
			"2026-10-17",
			RETURN_REMINDER_MAX_OVERDUE_DAYS,
		);
	});
});
