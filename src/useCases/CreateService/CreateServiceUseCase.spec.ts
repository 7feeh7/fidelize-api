import { beforeEach, describe, expect, it, vi } from "vitest";
import { Service } from "@/entities/Service";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { CreateServiceUseCase } from "./CreateServiceUseCase";

describe("CreateServiceUseCase", () => {
	let servicesRepository: IServicesRepository;
	let sut: CreateServiceUseCase;

	beforeEach(() => {
		servicesRepository = {
			findByName: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			listAll: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new CreateServiceUseCase(servicesRepository);
	});

	it("persiste novo serviço quando o nome está disponível", async () => {
		const request = {
			name: "Corte masculino",
			description: "Corte tradicional",
			price: 45.9,
			durationMinutes: 30,
			suggestedReturnDays: 21,
			active: true,
		};

		vi.mocked(servicesRepository.findByName).mockResolvedValue(null);

		await sut.execute(request);

		expect(servicesRepository.findByName).toHaveBeenCalledWith("Corte masculino");
		expect(servicesRepository.save).toHaveBeenCalledTimes(1);

		const savedService = vi.mocked(servicesRepository.save).mock.calls[0]?.[0];
		expect(savedService).toBeInstanceOf(Service);
		expect(savedService?.name).toBe("Corte masculino");
		expect(savedService?.description).toBe("Corte tradicional");
		expect(savedService?.price).toBe(45.9);
		expect(savedService?.durationMinutes).toBe(30);
		expect(savedService?.suggestedReturnDays).toBe(21);
		expect(savedService?.active).toBe(true);
	});

	it("persiste serviço com campos opcionais nulos e active padrão true", async () => {
		vi.mocked(servicesRepository.findByName).mockResolvedValue(null);

		await sut.execute({
			name: "Barba",
			price: 25,
		});

		const savedService = vi.mocked(servicesRepository.save).mock.calls[0]?.[0];
		expect(savedService?.description).toBeNull();
		expect(savedService?.durationMinutes).toBeNull();
		expect(savedService?.suggestedReturnDays).toBeNull();
		expect(savedService?.active).toBe(true);
	});

	it("lança erro quando o nome já está cadastrado", async () => {
		const existingService = new Service(
			{
				name: "Corte masculino",
				description: null,
				price: 40,
				durationMinutes: null,
				suggestedReturnDays: null,
				active: true,
			},
			"existing-id",
		);

		vi.mocked(servicesRepository.findByName).mockResolvedValue(existingService);

		await expect(
			sut.execute({
				name: "Corte masculino",
				price: 45.9,
			}),
		).rejects.toThrow("O serviço já existe");

		expect(servicesRepository.save).not.toHaveBeenCalled();
	});

	it("lança erro quando o preço é negativo", async () => {
		await expect(
			sut.execute({
				name: "Corte masculino",
				price: -1,
			}),
		).rejects.toThrow("Preço inválido");

		expect(servicesRepository.findByName).not.toHaveBeenCalled();
		expect(servicesRepository.save).not.toHaveBeenCalled();
	});

	it("lança erro quando a duração é inválida", async () => {
		await expect(
			sut.execute({
				name: "Corte masculino",
				price: 45.9,
				durationMinutes: 0,
			}),
		).rejects.toThrow("Duração inválida");

		expect(servicesRepository.findByName).not.toHaveBeenCalled();
		expect(servicesRepository.save).not.toHaveBeenCalled();
	});

	it("lança erro quando o prazo de retorno sugerido é inválido", async () => {
		await expect(
			sut.execute({
				name: "Corte masculino",
				price: 45.9,
				suggestedReturnDays: -5,
			}),
		).rejects.toThrow("Prazo de retorno sugerido inválido");

		expect(servicesRepository.findByName).not.toHaveBeenCalled();
		expect(servicesRepository.save).not.toHaveBeenCalled();
	});
});
