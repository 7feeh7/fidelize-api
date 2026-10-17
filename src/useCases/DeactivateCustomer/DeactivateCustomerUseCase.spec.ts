import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import { DeactivateCustomerUseCase } from "./DeactivateCustomerUseCase";

describe("DeactivateCustomerUseCase", () => {
	let customersRepository: ICustomersRepository;
	let sut: DeactivateCustomerUseCase;

	beforeEach(() => {
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new DeactivateCustomerUseCase(customersRepository);
	});

	it("desativa cliente ativo", async () => {
		const customer = new Customer(
			{
				name: "Ana Lima",
				phone: "11999998888",
				dateOfBirth: null,
				leadSource: "INSTAGRAM",
				active: true,
			},
			"customer-id",
		);

		vi.mocked(customersRepository.findActiveById).mockResolvedValue(customer);

		await sut.execute({ id: "customer-id" });

		expect(customersRepository.findActiveById).toHaveBeenCalledWith(
			"customer-id",
		);
		expect(customersRepository.deactivate).toHaveBeenCalledWith("customer-id");
	});

	it("lança erro quando o cliente não existe ou já está inativo", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(null);

		await expect(sut.execute({ id: "missing-id" })).rejects.toThrow(
			"Cliente não encontrado",
		);

		expect(customersRepository.deactivate).not.toHaveBeenCalled();
	});
});
