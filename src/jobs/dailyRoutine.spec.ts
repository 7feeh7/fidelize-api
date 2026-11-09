// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new
import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tenant } from "@/entities/Tenant";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { runDailyRoutine } from "./dailyRoutine";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";
import { generateBirthdaysStep } from "./generateBirthdaysStep";
import { generateReturnRemindersStep } from "./generateReturnRemindersStep";

vi.mock("@/repositories/implementations/PostgresTenantsRepository", () => ({
	PostgresTenantsRepository: vi.fn(),
}));
vi.mock("./expireCustomerRewardsStep", () => ({
	expireCustomerRewardsStep: vi.fn(),
}));
vi.mock("./generateReturnRemindersStep", () => ({
	generateReturnRemindersStep: vi.fn(),
}));
vi.mock("./generateBirthdaysStep", () => ({
	generateBirthdaysStep: vi.fn(),
}));
vi.mock("@/providers/implementations/PinoLogger", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe("runDailyRoutine", () => {
	const connection = {} as Knex;
	const salao = new Tenant(
		{ name: "Salão", slug: "salao", status: "ACTIVE" },
		"tenant-a",
	);
	const barbearia = new Tenant(
		{ name: "Barbearia", slug: "barbearia", status: "TRIAL" },
		"tenant-b",
	);
	const executedAt = new Date("2026-01-15T06:00:00.000Z");

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(PostgresTenantsRepository).mockImplementation(function () {
			return {
				listWithAccess: vi.fn().mockResolvedValue([salao, barbearia]),
			} as never;
		});
		vi.mocked(expireCustomerRewardsStep).mockResolvedValue({
			expiredCount: 0,
			executedAt,
		});
		vi.mocked(generateReturnRemindersStep).mockResolvedValue({
			generatedCount: 0,
			skippedNoActiveTemplate: false,
			executedAt,
		});
		vi.mocked(generateBirthdaysStep).mockResolvedValue({
			generatedCount: 0,
			grantedCount: 0,
			skippedNoActiveTemplate: false,
			skippedNoActiveRule: false,
			executedAt,
		});
	});

	it("roda os três passos para cada negócio com acesso", async () => {
		const result = await runDailyRoutine(connection);

		for (const tenant of [salao, barbearia]) {
			expect(expireCustomerRewardsStep).toHaveBeenCalledWith(
				connection,
				tenant,
			);
			expect(generateReturnRemindersStep).toHaveBeenCalledWith(
				connection,
				tenant,
			);
			expect(generateBirthdaysStep).toHaveBeenCalledWith(connection, tenant);
		}

		expect(result.tenants.map((item) => item.tenantId)).toEqual([
			"tenant-a",
			"tenant-b",
		]);
		expect(result.failedTenantIds).toEqual([]);
	});

	it("uma falha não impede os outros negócios, mas a execução termina com erro", async () => {
		vi.mocked(generateReturnRemindersStep).mockImplementation(
			async (_connection, tenant) => {
				if (tenant.id === "tenant-a") {
					throw new Error("falha no salão");
				}

				return {
					generatedCount: 0,
					skippedNoActiveTemplate: false,
					executedAt,
				};
			},
		);

		await expect(runDailyRoutine(connection)).rejects.toThrow(
			"Rotina diária falhou em 1 de 2 negócios",
		);

		expect(generateBirthdaysStep).toHaveBeenCalledWith(connection, barbearia);
		expect(generateBirthdaysStep).not.toHaveBeenCalledWith(connection, salao);
	});

	it("não faz nada quando nenhum negócio tem acesso", async () => {
		vi.mocked(PostgresTenantsRepository).mockImplementation(function () {
			return { listWithAccess: vi.fn().mockResolvedValue([]) } as never;
		});

		const result = await runDailyRoutine(connection);

		expect(expireCustomerRewardsStep).not.toHaveBeenCalled();
		expect(result.tenants).toEqual([]);
	});
});
