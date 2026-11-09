// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new
import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_MESSAGE_TEMPLATES } from "@/config/defaultMessageTemplates";
import { Tenant } from "@/entities/Tenant";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { CreateTenantUseCase } from "./CreateTenantUseCase";

vi.mock("@/repositories/implementations/PostgresTenantsRepository", () => ({
	PostgresTenantsRepository: vi.fn(),
}));
vi.mock(
	"@/repositories/implementations/PostgresMessageTemplatesRepository",
	() => ({
		PostgresMessageTemplatesRepository: vi.fn(),
	}),
);

describe("CreateTenantUseCase", () => {
	const saveTenant = vi.fn();
	const saveTemplate = vi.fn();
	let tenantsRepository: ITenantsRepository;
	let connection: Knex;
	let sut: CreateTenantUseCase;

	beforeEach(() => {
		saveTenant.mockReset();
		saveTemplate.mockReset();
		vi.mocked(PostgresTenantsRepository).mockImplementation(function () {
			return { save: saveTenant } as never;
		});
		vi.mocked(PostgresMessageTemplatesRepository).mockImplementation(
			function () {
				return { save: saveTemplate } as never;
			},
		);
		tenantsRepository = {
			save: vi.fn(),
			findById: vi.fn(),
			findBySlug: vi.fn().mockResolvedValue(null),
			listWithAccess: vi.fn(),
		};
		connection = {
			transaction: vi.fn(async (callback) => callback({} as Knex.Transaction)),
		} as unknown as Knex;
		sut = new CreateTenantUseCase(tenantsRepository, connection);
	});

	it("cria o negócio em TRIAL e os modelos padrão na mesma transação", async () => {
		const result = await sut.execute({
			name: " Barbearia do Zé ",
			slug: "barbearia-do-ze",
		});

		expect(connection.transaction).toHaveBeenCalledTimes(1);
		expect(saveTenant).toHaveBeenCalledTimes(1);

		const saved = saveTenant.mock.calls[0]?.[0] as Tenant;
		expect(saved).toBeInstanceOf(Tenant);
		expect(saved.name).toBe("Barbearia do Zé");
		expect(saved.slug).toBe("barbearia-do-ze");
		expect(saved.status).toBe("TRIAL");
		expect(result).toEqual({ id: saved.id });

		expect(saveTemplate).toHaveBeenCalledTimes(
			DEFAULT_MESSAGE_TEMPLATES.length,
		);
		for (const call of saveTemplate.mock.calls) {
			expect(call[0]).toBe(saved.id);
			expect(call[1].active).toBe(true);
		}
		expect(saveTemplate.mock.calls.map((call) => call[1].type)).toEqual([
			"RETURN_REMINDER",
			"BIRTHDAY",
		]);
	});

	it("rejeita slug já usado", async () => {
		vi.mocked(tenantsRepository.findBySlug).mockResolvedValue(
			new Tenant({ name: "Outro", slug: "salao", status: "ACTIVE" }),
		);

		await expect(sut.execute({ name: "Salão", slug: "salao" })).rejects.toThrow(
			"O slug já está em uso",
		);

		expect(connection.transaction).not.toHaveBeenCalled();
	});

	it("traduz a violação de unicidade quando dois cadastros disputam o slug", async () => {
		saveTenant.mockRejectedValue(Object.assign(new Error(), { code: "23505" }));

		await expect(sut.execute({ name: "Salão", slug: "salao" })).rejects.toThrow(
			"O slug já está em uso",
		);
	});

	it.each(["", "Com Espaco", "MAIUSCULA", "acento-é", "-inicio", "fim-"])(
		"rejeita slug inválido: %s",
		async (slug) => {
			await expect(sut.execute({ name: "Salão", slug })).rejects.toThrow(
				"Slug inválido",
			);
		},
	);

	it("rejeita nome vazio", async () => {
		await expect(sut.execute({ name: "  ", slug: "salao" })).rejects.toThrow(
			"Nome do negócio inválido",
		);
	});
});
