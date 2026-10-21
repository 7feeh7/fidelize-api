import { beforeEach, describe, expect, it, vi } from "vitest";
import { Service } from "@/entities/Service";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { UpdateServiceUseCase } from "./UpdateServiceUseCase";

describe("UpdateServiceUseCase", () => {
	let servicesRepository: IServicesRepository;
	let sut: UpdateServiceUseCase;

	const existingService = new Service(
		{
			name: "Corte masculino",
			description: "Corte tradicional",
			price: 45.9,
			durationMinutes: 30,
			suggestedReturnDays: 21,
			active: true,
		},
		"service-id",
	);

	beforeEach(() => {
		servicesRepository = {
			findByName: vi.fn(),
			findById: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			listAll: vi.fn(),
			deactivate: vi.fn(),
			update: vi.fn(),
		};
		sut = new UpdateServiceUseCase(servicesRepository);
	});

	it("atualiza serviço quando o nome continua disponível", async () => {
		vi.mocked(servicesRepository.findById).mockResolvedValue(existingService);
		vi.mocked(servicesRepository.findByName).mockResolvedValue(null);

		await sut.execute({
			id: "service-id",
			name: "Corte masculino premium",
			description: "Com finalização",
			price: 55,
			durationMinutes: 45,
			suggestedReturnDays: 28,
		});

		expect(servicesRepository.update).toHaveBeenCalledTimes(1);
		const updated = vi.mocked(servicesRepository.update).mock.calls[0]?.[0];
		expect(updated?.name).toBe("Corte masculino premium");
		expect(updated?.price).toBe(55);
		expect(updated?.active).toBe(true);
	});

	it("permite manter o mesmo nome do próprio serviço", async () => {
		vi.mocked(servicesRepository.findById).mockResolvedValue(existingService);
		vi.mocked(servicesRepository.findByName).mockResolvedValue(existingService);

		await sut.execute({
			id: "service-id",
			name: "Corte masculino",
			price: 50,
		});

		expect(servicesRepository.update).toHaveBeenCalledTimes(1);
	});

	it("lança erro quando o serviço não existe", async () => {
		vi.mocked(servicesRepository.findById).mockResolvedValue(null);

		await expect(
			sut.execute({
				id: "missing",
				name: "Corte",
				price: 40,
			}),
		).rejects.toThrow("Serviço não encontrado");

		expect(servicesRepository.update).not.toHaveBeenCalled();
	});

	it("lança erro quando o nome já pertence a outro serviço", async () => {
		vi.mocked(servicesRepository.findById).mockResolvedValue(existingService);
		vi.mocked(servicesRepository.findByName).mockResolvedValue(
			new Service(
				{
					name: "Barba",
					description: null,
					price: 25,
					durationMinutes: null,
					suggestedReturnDays: null,
					active: true,
				},
				"other-id",
			),
		);

		await expect(
			sut.execute({
				id: "service-id",
				name: "Barba",
				price: 45.9,
			}),
		).rejects.toThrow("O serviço já existe");

		expect(servicesRepository.update).not.toHaveBeenCalled();
	});

	it("lança erro quando o preço é negativo", async () => {
		await expect(
			sut.execute({
				id: "service-id",
				name: "Corte masculino",
				price: -1,
			}),
		).rejects.toThrow("Preço inválido");

		expect(servicesRepository.findById).not.toHaveBeenCalled();
	});
});
