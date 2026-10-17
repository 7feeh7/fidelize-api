import { beforeEach, describe, expect, it, vi } from "vitest";
import { Service } from "@/entities/Service";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { DeactivateServiceUseCase } from "./DeactivateServiceUseCase";

describe("DeactivateServiceUseCase", () => {
	let servicesRepository: IServicesRepository;
	let sut: DeactivateServiceUseCase;

	beforeEach(() => {
		servicesRepository = {
			findByName: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			listAll: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new DeactivateServiceUseCase(servicesRepository);
	});

	it("desativa serviço ativo", async () => {
		const service = new Service(
			{
				name: "Corte masculino",
				description: null,
				price: 45.9,
				durationMinutes: 30,
				suggestedReturnDays: 21,
				active: true,
			},
			"service-id",
		);

		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(service);

		await sut.execute({ id: "service-id" });

		expect(servicesRepository.findActiveById).toHaveBeenCalledWith("service-id");
		expect(servicesRepository.deactivate).toHaveBeenCalledWith("service-id");
	});

	it("lança erro quando o serviço não existe ou já está inativo", async () => {
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(null);

		await expect(sut.execute({ id: "missing-id" })).rejects.toThrow(
			"Serviço não encontrado",
		);

		expect(servicesRepository.deactivate).not.toHaveBeenCalled();
	});
});
