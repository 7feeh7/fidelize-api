import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import { ListCustomersUseCase } from "./ListCustomersUseCase";

describe("ListCustomersUseCase", () => {
	let customersRepository: ICustomersRepository;
	let sut: ListCustomersUseCase;

	beforeEach(() => {
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new ListCustomersUseCase(customersRepository);
	});

	it("retorna clientes paginados com metadados de página", async () => {
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

		vi.mocked(customersRepository.list).mockResolvedValue({
			items: [customer],
			total: 11,
		});

		const result = await sut.execute({ page: 2, perPage: 10, search: "ana" });

		expect(customersRepository.list).toHaveBeenCalledWith({
			page: 2,
			perPage: 10,
			search: "ana",
		});
		expect(result).toEqual({
			data: [
				{
					id: "customer-id",
					name: "Ana Lima",
					phone: "11999998888",
					dateOfBirth: null,
					leadSource: "INSTAGRAM",
				},
			],
			page: 2,
			totalPages: 2,
		});
	});

	it("normaliza página e tamanho inválidos", async () => {
		vi.mocked(customersRepository.list).mockResolvedValue({
			items: [],
			total: 0,
		});

		const result = await sut.execute({ page: 0, perPage: 0 });

		expect(customersRepository.list).toHaveBeenCalledWith({
			page: 1,
			perPage: 10,
			search: undefined,
		});
		expect(result.totalPages).toBe(0);
	});
});
