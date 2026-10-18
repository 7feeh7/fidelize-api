// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Knex } from "knex";
import { generateBirthdaysStep } from "./generateBirthdaysStep";

vi.mock(
	"@/repositories/implementations/PostgresMessageTemplatesRepository",
	() => ({
		PostgresMessageTemplatesRepository: vi.fn(),
	}),
);

vi.mock(
	"@/repositories/implementations/PostgresLoyaltyRulesRepository",
	() => ({
		PostgresLoyaltyRulesRepository: vi.fn(),
	}),
);

vi.mock("@/repositories/implementations/PostgresBirthdaysRepository", () => ({
	PostgresBirthdaysRepository: vi.fn(),
}));

vi.mock("@/repositories/implementations/PostgresMessagesRepository", () => ({
	PostgresMessagesRepository: vi.fn(),
}));

vi.mock(
	"@/repositories/implementations/PostgresCustomerRewardsRepository",
	() => ({
		PostgresCustomerRewardsRepository: vi.fn(),
	}),
);

vi.mock("@/repositories/implementations/PostgresCustomersRepository", () => ({
	PostgresCustomersRepository: vi.fn(),
}));

vi.mock(
	"@/repositories/implementations/PostgresAppointmentsRepository",
	() => ({
		PostgresAppointmentsRepository: vi.fn(),
	}),
);

describe("generateBirthdaysStep", () => {
	let connection: Knex;
	const saveMessage = vi.fn();
	const saveReward = vi.fn();

	beforeEach(async () => {
		connection = {} as Knex;
		saveMessage.mockReset();
		saveReward.mockReset();

		const { PostgresMessageTemplatesRepository } = await import(
			"@/repositories/implementations/PostgresMessageTemplatesRepository"
		);
		const { PostgresLoyaltyRulesRepository } = await import(
			"@/repositories/implementations/PostgresLoyaltyRulesRepository"
		);
		const { PostgresBirthdaysRepository } = await import(
			"@/repositories/implementations/PostgresBirthdaysRepository"
		);
		const { PostgresMessagesRepository } = await import(
			"@/repositories/implementations/PostgresMessagesRepository"
		);
		const { PostgresCustomerRewardsRepository } = await import(
			"@/repositories/implementations/PostgresCustomerRewardsRepository"
		);
		const { PostgresCustomersRepository } = await import(
			"@/repositories/implementations/PostgresCustomersRepository"
		);
		const { PostgresAppointmentsRepository } = await import(
			"@/repositories/implementations/PostgresAppointmentsRepository"
		);

		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			function () {
				return {
					findActiveAutomaticByType: vi.fn().mockResolvedValue(null),
				} as never;
			},
		);

		vi.mocked(PostgresLoyaltyRulesRepository).mockImplementation(function () {
			return {
				listActiveByTriggerType: vi.fn().mockResolvedValue([]),
			} as never;
		});

		vi.mocked(PostgresBirthdaysRepository).mockImplementation(function () {
			return {
				listCandidatesForDate: vi.fn().mockResolvedValue([]),
			} as never;
		});

		vi.mocked(PostgresMessagesRepository).mockImplementation(function () {
			return {
				save: saveMessage,
				existsBirthdayMessageForYear: vi.fn().mockResolvedValue(false),
			} as never;
		});

		vi.mocked(PostgresCustomerRewardsRepository).mockImplementation(
			function () {
				return {
					save: saveReward,
					existsBirthdayGrantForYear: vi.fn().mockResolvedValue(false),
					findDetailById: vi.fn().mockResolvedValue(null),
					findSoonestExpiringAvailable: vi.fn().mockResolvedValue(null),
				} as never;
			},
		);

		vi.mocked(PostgresCustomersRepository).mockImplementation(function () {
			return {} as never;
		});
		vi.mocked(PostgresAppointmentsRepository).mockImplementation(function () {
			return {} as never;
		});
	});

	it("não processa aniversários quando não há modelo nem regra ativos", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const result = await generateBirthdaysStep(connection, referenceDate);

		expect(result.generatedCount).toBe(0);
		expect(result.grantedCount).toBe(0);
		expect(result.skippedNoActiveTemplate).toBe(true);
		expect(result.skippedNoActiveRule).toBe(true);
		expect(saveMessage).not.toHaveBeenCalled();
		expect(saveReward).not.toHaveBeenCalled();
	});
});
