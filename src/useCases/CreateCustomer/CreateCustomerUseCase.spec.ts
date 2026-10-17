import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import { CreateCustomerUseCase } from "./CreateCustomerUseCase";

describe("CreateCustomerUseCase", () => {
	let customersRepository: ICustomersRepository;
	let createReferralUseCase: CreateReferralUseCase;
	let sut: CreateCustomerUseCase;

	beforeEach(() => {
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		createReferralUseCase = {
			execute: vi.fn(),
		} as unknown as CreateReferralUseCase;
		sut = new CreateCustomerUseCase(
			customersRepository,
			createReferralUseCase,
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

		await sut.execute(request);

		expect(customersRepository.findByPhone).toHaveBeenCalledWith("11999998888");
		expect(customersRepository.save).toHaveBeenCalledTimes(1);

		const savedCustomer = vi.mocked(customersRepository.save).mock
			.calls[0]?.[0];
		expect(savedCustomer).toBeInstanceOf(Customer);
		expect(savedCustomer?.name).toBe("João Souza");
		expect(savedCustomer?.phone).toBe("11999998888");
		expect(savedCustomer?.dateOfBirth).toBe("1990-05-15");
		expect(savedCustomer?.leadSource).toBe("INSTAGRAM");
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

		expect(createReferralUseCase.execute).toHaveBeenCalledWith({
			referrerId: "referrer-id",
			referredId: expect.any(String),
		});
	});

	it("persiste cliente sem data de nascimento quando não informada", async () => {
		vi.mocked(customersRepository.findByPhone).mockResolvedValue(null);

		await sut.execute({
			name: "Ana Lima",
			phone: "21988887777",
			leadSource: "INDICACAO",
			referrerId: "referrer-id",
		});

		const savedCustomer = vi.mocked(customersRepository.save).mock
			.calls[0]?.[0];
		expect(savedCustomer?.dateOfBirth).toBeNull();
	});

	it("exige indicador quando a origem é indicação", async () => {
		await expect(
			sut.execute({
				name: "Ana Lima",
				phone: "21988887777",
				leadSource: "INDICACAO",
			}),
		).rejects.toThrow("Informe quem indicou o cliente");

		expect(customersRepository.save).not.toHaveBeenCalled();
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

		expect(customersRepository.save).not.toHaveBeenCalled();
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
		expect(customersRepository.save).not.toHaveBeenCalled();
	});
});
