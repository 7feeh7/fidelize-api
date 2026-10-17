import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import type { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import { UpdateCustomerUseCase } from "./UpdateCustomerUseCase";

describe("UpdateCustomerUseCase", () => {
	let customersRepository: ICustomersRepository;
	let referralsRepository: IReferralsRepository;
	let createReferralUseCase: CreateReferralUseCase;
	let sut: UpdateCustomerUseCase;

	function createExistingCustomer() {
		return new Customer(
			{
				name: "Ana Lima",
				phone: "11999998888",
				dateOfBirth: "1990-05-15",
				leadSource: "INSTAGRAM",
				active: true,
			},
			"customer-id",
		);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		referralsRepository = {
			save: vi.fn(),
			findByReferredId: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
			list: vi.fn(),
			countByReferrerId: vi.fn(),
			convertPendingByReferredId: vi.fn(),
		};
		createReferralUseCase = {
			execute: vi.fn(),
		} as unknown as CreateReferralUseCase;
		sut = new UpdateCustomerUseCase(
			customersRepository,
			referralsRepository,
			createReferralUseCase,
		);
		vi.mocked(customersRepository.findActiveById).mockImplementation(async () =>
			createExistingCustomer(),
		);
		vi.mocked(referralsRepository.findByReferredId).mockResolvedValue(null);
	});

	it("atualiza nome, telefone, aniversário e origem do lead", async () => {
		await sut.execute({
			id: "customer-id",
			name: "Ana Souza",
			phone: "11988887777",
			dateOfBirth: "1991-06-20",
			leadSource: "INDICACAO",
			referrerId: "referrer-id",
		});

		expect(customersRepository.findByPhone).toHaveBeenCalledWith("11988887777");
		expect(customersRepository.update).toHaveBeenCalledTimes(1);
		expect(createReferralUseCase.execute).toHaveBeenCalledWith({
			referrerId: "referrer-id",
			referredId: "customer-id",
		});

		const updatedCustomer = vi.mocked(customersRepository.update).mock
			.calls[0]?.[0];
		expect(updatedCustomer?.name).toBe("Ana Souza");
		expect(updatedCustomer?.phone).toBe("11988887777");
		expect(updatedCustomer?.dateOfBirth).toBe("1991-06-20");
		expect(updatedCustomer?.leadSource).toBe("INDICACAO");
	});

	it("não consulta telefone quando ele não mudou", async () => {
		await sut.execute({
			id: "customer-id",
			name: "Ana Souza",
			phone: "11999998888",
			dateOfBirth: null,
			leadSource: "INSTAGRAM",
		});

		expect(customersRepository.findByPhone).not.toHaveBeenCalled();
		expect(customersRepository.update).toHaveBeenCalledTimes(1);
	});

	it("lança erro quando a origem é indicação sem indicador e sem registro prévio", async () => {
		await expect(
			sut.execute({
				id: "customer-id",
				name: "Ana Souza",
				phone: "11999998888",
				leadSource: "INDICACAO",
			}),
		).rejects.toThrow("Informe quem indicou o cliente");

		expect(customersRepository.update).not.toHaveBeenCalled();
	});

	it("lança erro quando o telefone já pertence a outro cliente", async () => {
		const otherCustomer = new Customer(
			{
				name: "Outro",
				phone: "11988887777",
				dateOfBirth: null,
				leadSource: "OUTRO",
				active: true,
			},
			"other-id",
		);

		vi.mocked(customersRepository.findByPhone).mockResolvedValue(otherCustomer);

		await expect(
			sut.execute({
				id: "customer-id",
				name: "Ana Lima",
				phone: "11988887777",
				leadSource: "INSTAGRAM",
			}),
		).rejects.toThrow("O cliente já existe");

		expect(customersRepository.update).not.toHaveBeenCalled();
	});

	it("lança erro quando o cliente não existe", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(null);

		await expect(
			sut.execute({
				id: "missing-id",
				name: "Ana Lima",
				phone: "11999998888",
				leadSource: "INSTAGRAM",
			}),
		).rejects.toThrow("Cliente não encontrado");

		expect(customersRepository.update).not.toHaveBeenCalled();
	});
});
