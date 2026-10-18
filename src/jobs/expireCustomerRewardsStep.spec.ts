// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new

import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";

vi.mock(
	"@/repositories/implementations/PostgresCustomerRewardsRepository",
	() => ({
		PostgresCustomerRewardsRepository: vi.fn(),
	}),
);

describe("expireCustomerRewardsStep", () => {
	let connection: Knex;

	beforeEach(() => {
		connection = {} as Knex;
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
