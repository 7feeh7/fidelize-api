import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoyaltyRule } from "@/entities/LoyaltyRule";
import { Service } from "@/entities/Service";
import type { ILoyaltyRulesRepository } from "@/repositories/ILoyaltyRulesRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { CreateLoyaltyRuleUseCase } from "./CreateLoyaltyRuleUseCase";

describe("CreateLoyaltyRuleUseCase", () => {
	let loyaltyRulesRepository: ILoyaltyRulesRepository;
	let servicesRepository: IServicesRepository;
	let sut: CreateLoyaltyRuleUseCase;

	beforeEach(() => {
		loyaltyRulesRepository = {
			save: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
			update: vi.fn(),
			setActive: vi.fn(),
			listActiveByTriggerType: vi.fn(),
		};
		servicesRepository = {
			save: vi.fn(),
			findByName: vi.fn(),
			findActiveById: vi.fn(),
			listAll: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new CreateLoyaltyRuleUseCase(
			loyaltyRulesRepository,
			servicesRepository,
		);
	});

	it("persiste regra de aniversário com desconto percentual", async () => {
		await sut.execute({
			name: "Aniversário",
			triggerType: "BIRTHDAY",
			rewardType: "PERCENT_DISCOUNT",
			rewardValue: 15,
			validDays: 30,
		});

		expect(servicesRepository.findActiveById).not.toHaveBeenCalled();
		expect(loyaltyRulesRepository.save).toHaveBeenCalledTimes(1);

		const savedRule = vi.mocked(loyaltyRulesRepository.save).mock
			.calls[0]?.[0];
		expect(savedRule).toBeInstanceOf(LoyaltyRule);
		expect(savedRule?.name).toBe("Aniversário");
		expect(savedRule?.triggerType).toBe("BIRTHDAY");
		expect(savedRule?.rewardValue).toBe(15);
		expect(savedRule?.validDays).toBe(30);
		expect(savedRule?.active).toBe(true);
	});

	it("valida serviço grátis ativo antes de salvar", async () => {
		const service = new Service(
			{
				name: "Hidratação",
				description: null,
				price: 80,
				durationMinutes: null,
				suggestedReturnDays: null,
				active: true,
			},
			"service-id",
		);

		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(service);

		await sut.execute({
			name: "5ª visita",
			triggerType: "VISIT_COUNT",
			visitCount: 5,
			rewardType: "FREE_SERVICE",
			freeServiceId: "service-id",
		});

		expect(servicesRepository.findActiveById).toHaveBeenCalledWith(
			"service-id",
		);
		expect(loyaltyRulesRepository.save).toHaveBeenCalledTimes(1);
	});

	it("lança erro quando o serviço grátis não existe", async () => {
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(null);

		await expect(
			sut.execute({
				name: "5ª visita",
				triggerType: "VISIT_COUNT",
				visitCount: 5,
				rewardType: "FREE_SERVICE",
				freeServiceId: "missing",
			}),
		).rejects.toThrow("Serviço grátis inválido");

		expect(loyaltyRulesRepository.save).not.toHaveBeenCalled();
	});
});
