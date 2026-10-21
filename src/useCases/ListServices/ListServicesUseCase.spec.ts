import { beforeEach, describe, expect, it, vi } from "vitest";
import { Service } from "@/entities/Service";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { ListServicesUseCase } from "./ListServicesUseCase";

describe("ListServicesUseCase", () => {
	let servicesRepository: IServicesRepository;
	let sut: ListServicesUseCase;

	beforeEach(() => {
		servicesRepository = {
			findByName: vi.fn(),
			findById: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			listAll: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new ListServicesUseCase(servicesRepository);
	});

	it("retorna serviços ativos e inativos sem paginação", async () => {
		const activeService = new Service(
			{
				name: "Corte masculino",
				description: null,
				price: 45.9,
				durationMinutes: 30,
				suggestedReturnDays: 21,
				active: true,
			},
			"service-active",
		);
		const inactiveService = new Service(
			{
				name: "Barba",
				description: null,
				price: 25,
				durationMinutes: null,
				suggestedReturnDays: null,
				active: false,
			},
			"service-inactive",
		);

		vi.mocked(servicesRepository.listAll).mockResolvedValue([
			activeService,
			inactiveService,
		]);

		const result = await sut.execute();

		expect(servicesRepository.listAll).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			data: [
				{
					id: "service-active",
					name: "Corte masculino",
					description: null,
					price: 45.9,
					durationMinutes: 30,
					suggestedReturnDays: 21,
					active: true,
				},
				{
					id: "service-inactive",
					name: "Barba",
					description: null,
					price: 25,
					durationMinutes: null,
					suggestedReturnDays: null,
					active: false,
				},
			],
		});
	});
});
