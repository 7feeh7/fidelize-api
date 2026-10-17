import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import { CreateCustomerUseCase } from "./CreateCustomerUseCase";

vi.mock("@/repositories/implementations/PostgresCustomersRepository", () => ({
	PostgresCustomersRepository: vi.fn(),
}));
vi.mock("@/services/createGrantCustomerRewardsService", () => ({
	createGrantCustomerRewardsService: vi.fn(() => ({
		grantFirstVisit: vi.fn().mockResolvedValue([
			{
				id: "reward-id",
				ruleName: "Boas-vindas",
				rewardSummary: "10% de desconto",
				preview: "Na primeira visita, o cliente ganha 10% de desconto",
			},
		]),
	})),
}));

describe("CreateCustomerUseCase", () => {
	let customersRepository: ICustomersRepository;
	let createReferralUseCase: CreateReferralUseCase;
	let connection: Knex;
	let trxCustomersRepository: ICustomersRepository;
	let sut: CreateCustomerUseCase;

	beforeEach(async () => {
		trxCustomersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		const { PostgresCustomersRepository } = await import(
			"@/repositories/implementations/PostgresCustomersRepository"
		);
		vi.mocked(PostgresCustomersRepository).mockImplementation(function () {
			return trxCustomersRepository as never;
		});
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		createReferralUseCase = {
			execute: vi.fn().mockResolvedValue({ grantedRewards: [] }),
		} as unknown as CreateReferralUseCase;
		connection = {
			transaction: vi.fn(async (callback) => callback({} as Knex.Transaction)),
		} as unknown as Knex;
		sut = new CreateCustomerUseCase(
			customersRepository,
			createReferralUseCase,
			connection,
		);
	});

	it("persiste novo cliente quando o telefone está disponível", async () => {
		const request = {
			name: "João Souza",
			phone: "11999998888",
			dateOfBirth: "1990-05-15",
			leadSource: "INSTAGRAM" as const,
		};

		vi.mocked(customersRepository.findByPhone).mockResolvedValue(null);

		const result = await sut.execute(request);

		expect(customersRepository.findByPhone).toHaveBeenCalledWith("11999998888");
		expect(connection.transaction).toHaveBeenCalledTimes(1);
		expect(result.grantedRewards).toHaveLength(1);
		expect(createReferralUseCase.execute).not.toHaveBeenCalled();
	});

	it("cria indicação quando a origem é indicação", async () => {
		vi.mocked(customersRepository.findByPhone).mockResolvedValue(null);

		await sut.execute({
			name: "Ana Lima",
			phone: "21988887777",
			leadSource: "INDICACAO",
			referrerId: "referrer-id",
		});

		expect(createReferralUseCase.execute).toHaveBeenCalledWith(
			{
				referrerId: "referrer-id",
				referredId: expect.any(String),
			},
			expect.anything(),
		);
	});

	it("não concede FIRST_VISIT quando o cliente já existia no salão", async () => {
		const { createGrantCustomerRewardsService } = await import(
			"@/services/createGrantCustomerRewardsService"
		);
		vi.mocked(customersRepository.findByPhone).mockResolvedValue(null);

		const result = await sut.execute({
			name: "João Souza",
			phone: "11999998888",
			leadSource: "PANFLETO",
			isExistingCustomer: true,
		});

		expect(createGrantCustomerRewardsService).not.toHaveBeenCalled();
		expect(result.grantedRewards).toEqual([]);
	});

	it("persiste cliente sem data de nascimento quando não informada", async () => {
		vi.mocked(customersRepository.findByPhone).mockResolvedValue(null);

		await sut.execute({
			name: "Ana Lima",
			phone: "21988887777",
			leadSource: "INDICACAO",
			referrerId: "referrer-id",
		});

		expect(connection.transaction).toHaveBeenCalled();
	});

	it("exige indicador quando a origem é indicação", async () => {
		await expect(
			sut.execute({
				name: "Ana Lima",
				phone: "21988887777",
				leadSource: "INDICACAO",
			}),
		).rejects.toThrow("Informe quem indicou o cliente");

		expect(connection.transaction).not.toHaveBeenCalled();
	});

	it("lança erro quando o telefone já está cadastrado", async () => {
		const existingCustomer = new Customer(
			{
				name: "Cliente existente",
				phone: "11999998888",
				dateOfBirth: null,
				leadSource: "OUTRO",
			},
			"existing-id",
		);

		vi.mocked(customersRepository.findByPhone).mockResolvedValue(
			existingCustomer,
		);

		await expect(
			sut.execute({
				name: "João Souza",
				phone: "11999998888",
				leadSource: "PANFLETO",
			}),
		).rejects.toThrow("O cliente já existe");

		expect(connection.transaction).not.toHaveBeenCalled();
	});

	it("lança erro quando a origem do lead é inválida", async () => {
		await expect(
			sut.execute({
				name: "João Souza",
				phone: "11999998888",
				leadSource: "FACEBOOK" as "INSTAGRAM",
			}),
		).rejects.toThrow("Origem do lead inválida");

		expect(customersRepository.findByPhone).not.toHaveBeenCalled();
		expect(connection.transaction).not.toHaveBeenCalled();
	});
});
