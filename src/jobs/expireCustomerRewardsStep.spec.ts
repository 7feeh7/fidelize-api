import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Knex } from "knex";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";

vi.mock(
	"@/repositories/implementations/PostgresCustomerRewardsRepository",
	() => ({
		PostgresCustomerRewardsRepository: vi.fn(),
	}),
);

describe("expireCustomerRewardsStep", () => {
	let connection: Knex;

	beforeEach(async () => {
		connection = {} as Knex;
		const { PostgresCustomerRewardsRepository } = await import(
			"@/repositories/implementations/PostgresCustomerRewardsRepository"
		);
		vi.mocked(PostgresCustomerRewardsRepository).mockImplementation(
			function () {
				return {
					expireAvailablePastDue: vi.fn().mockResolvedValue(4),
				} as never;
			},
		);
	});

	it("retorna a quantidade de benefícios expirados", async () => {
		const referenceDate = new Date("2026-10-17T03:00:00.000Z");
		const result = await expireCustomerRewardsStep(connection, referenceDate);

		expect(result.expiredCount).toBe(4);
		expect(result.executedAt).toEqual(referenceDate);
	});
});
