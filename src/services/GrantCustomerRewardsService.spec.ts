import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoyaltyRule } from "@/entities/LoyaltyRule";
import { Referral } from "@/entities/Referral";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type {
	ILoyaltyRulesRepository,
	LoyaltyRuleRecord,
} from "@/repositories/ILoyaltyRulesRepository";
import { GrantCustomerRewardsService } from "./GrantCustomerRewardsService";

describe("GrantCustomerRewardsService", () => {
	let loyaltyRulesRepository: ILoyaltyRulesRepository;
	let customerRewardsRepository: ICustomerRewardsRepository;
	let sut: GrantCustomerRewardsService;

	const firstVisitRule: LoyaltyRuleRecord = {
		rule: new LoyaltyRule(
			{
				name: "Boas-vindas",
				description: null,
				triggerType: "FIRST_VISIT",
				visitCount: null,
				rewardType: "PERCENT_DISCOUNT",
				rewardValue: 10,
				freeServiceId: null,
				validDays: 30,
				active: true,
			},
			"rule-first-visit",
		),
		freeServiceName: null,
	};

	beforeEach(() => {
		loyaltyRulesRepository = {
			save: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
			update: vi.fn(),
			setActive: vi.fn(),
			listActiveByTriggerType: vi.fn(),
		};
		customerRewardsRepository = {
			save: vi.fn(),
			existsByGrantKey: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			findUsedDetailByAppointmentId: vi.fn(),
			expireAvailablePastDue: vi.fn(),
			listByCustomerId: vi.fn(),
			update: vi.fn(),
		};
		sut = new GrantCustomerRewardsService(
			loyaltyRulesRepository,
			customerRewardsRepository,
		);
	});

	it("concede FIRST_VISIT quando ainda não existe para o cliente", async () => {
		vi.mocked(loyaltyRulesRepository.listActiveByTriggerType).mockResolvedValue(
			[firstVisitRule],
		);
		vi.mocked(customerRewardsRepository.existsByGrantKey).mockResolvedValue(
			false,
		);

		const granted = await sut.grantFirstVisit("customer-id");

		expect(granted).toHaveLength(1);
		expect(granted[0]?.ruleName).toBe("Boas-vindas");
		expect(customerRewardsRepository.save).toHaveBeenCalledTimes(1);
	});

	it("não duplica benefício para a mesma regra e cliente", async () => {
		vi.mocked(loyaltyRulesRepository.listActiveByTriggerType).mockResolvedValue(
			[firstVisitRule],
		);
		vi.mocked(customerRewardsRepository.existsByGrantKey).mockResolvedValue(
			true,
		);

		const granted = await sut.grantFirstVisit("customer-id");

		expect(granted).toHaveLength(0);
		expect(customerRewardsRepository.save).not.toHaveBeenCalled();
	});

	it("concede VISIT_COUNT quando a visita registrada é N-1", async () => {
		const visitRule: LoyaltyRuleRecord = {
			rule: new LoyaltyRule(
				{
					name: "5ª visita",
					description: null,
					triggerType: "VISIT_COUNT",
					visitCount: 5,
					rewardType: "FIXED_DISCOUNT",
					rewardValue: 20,
					freeServiceId: null,
					validDays: null,
					active: true,
				},
				"rule-visit-5",
			),
			freeServiceName: null,
		};

		vi.mocked(loyaltyRulesRepository.listActiveByTriggerType).mockResolvedValue(
			[visitRule],
		);
		vi.mocked(customerRewardsRepository.existsByGrantKey).mockResolvedValue(
			false,
		);

		const granted = await sut.grantVisitCount("customer-id", 4);

		expect(granted).toHaveLength(1);
		expect(customerRewardsRepository.save).toHaveBeenCalledTimes(1);
	});

	it("concede benefício de indicação recebida com referral_id", async () => {
		const referralRule: LoyaltyRuleRecord = {
			rule: new LoyaltyRule(
				{
					name: "Indicado",
					description: null,
					triggerType: "REFERRAL_RECEIVED",
					visitCount: null,
					rewardType: "PERCENT_DISCOUNT",
					rewardValue: 15,
					freeServiceId: null,
					validDays: null,
					active: true,
				},
				"rule-referral-received",
			),
			freeServiceName: null,
		};

		vi.mocked(loyaltyRulesRepository.listActiveByTriggerType).mockResolvedValue(
			[referralRule],
		);
		vi.mocked(customerRewardsRepository.existsByGrantKey).mockResolvedValue(
			false,
		);

		const referral = new Referral(
			{
				referrerId: "referrer-id",
				referredId: "referred-id",
				status: "PENDING",
				convertedAt: null,
			},
			"referral-id",
		);

		await sut.grantForNewReferral(referral);

		expect(customerRewardsRepository.existsByGrantKey).toHaveBeenCalledWith(
			"referred-id",
			"rule-referral-received",
			"referral-id",
		);
	});
});
