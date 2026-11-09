import { CustomerReward } from "@/entities/CustomerReward";
import type { Referral } from "@/entities/Referral";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type {
	ILoyaltyRulesRepository,
	LoyaltyRuleRecord,
} from "@/repositories/ILoyaltyRulesRepository";
import { buildLoyaltyRulePresentation } from "@/utils/loyaltyRulePresentation";

export interface GrantedRewardDTO {
	id: string;
	ruleName: string;
	rewardSummary: string;
	preview: string;
}

function computeExpiresAt(
	grantedAt: Date,
	validDays: number | null,
): Date | null {
	if (validDays == null) {
		return null;
	}

	const expiresAt = new Date(grantedAt);
	expiresAt.setUTCDate(expiresAt.getUTCDate() + validDays);
	return expiresAt;
}

function toGrantedRewardDTO(
	record: LoyaltyRuleRecord,
	rewardId: string,
): GrantedRewardDTO {
	const presentation = buildLoyaltyRulePresentation({
		triggerType: record.rule.triggerType,
		visitCount: record.rule.visitCount,
		rewardType: record.rule.rewardType,
		rewardValue: record.rule.rewardValue,
		freeServiceName: record.freeServiceName,
		validDays: record.rule.validDays,
	});

	return {
		id: rewardId,
		ruleName: record.rule.name,
		rewardSummary: presentation.rewardSummary,
		preview: presentation.preview,
	};
}

export class GrantCustomerRewardsService {
	constructor(
		private loyaltyRulesRepository: ILoyaltyRulesRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
	) {}

	async grantFirstVisit(
		tenantId: string,
		customerId: string,
	): Promise<GrantedRewardDTO[]> {
		const rules = await this.loyaltyRulesRepository.listActiveByTriggerType(
			tenantId,
			"FIRST_VISIT",
		);

		return this.grantRulesForCustomer(tenantId, customerId, rules, null);
	}

	async grantReferralReceived(
		tenantId: string,
		customerId: string,
		referralId: string,
	): Promise<GrantedRewardDTO[]> {
		const rules = await this.loyaltyRulesRepository.listActiveByTriggerType(
			tenantId,
			"REFERRAL_RECEIVED",
		);

		return this.grantRulesForCustomer(tenantId, customerId, rules, referralId);
	}

	async grantReferralGiven(
		tenantId: string,
		referrerId: string,
		referralId: string,
	): Promise<GrantedRewardDTO[]> {
		const rules = await this.loyaltyRulesRepository.listActiveByTriggerType(
			tenantId,
			"REFERRAL_GIVEN",
		);

		return this.grantRulesForCustomer(tenantId, referrerId, rules, referralId);
	}

	async grantVisitCount(
		tenantId: string,
		customerId: string,
		appointmentCount: number,
	): Promise<GrantedRewardDTO[]> {
		const rules = await this.loyaltyRulesRepository.listActiveByTriggerType(
			tenantId,
			"VISIT_COUNT",
		);

		const matchingRules = rules.filter(
			(record) =>
				record.rule.visitCount != null &&
				record.rule.visitCount - 1 === appointmentCount,
		);

		return this.grantRulesForCustomer(
			tenantId,
			customerId,
			matchingRules,
			null,
		);
	}

	async grantManual(
		tenantId: string,
		customerId: string,
		loyaltyRuleId: string,
	): Promise<GrantedRewardDTO> {
		const record = await this.loyaltyRulesRepository.findById(
			tenantId,
			loyaltyRuleId,
		);

		if (!record) {
			throw new Error("Regra de fidelidade não encontrada");
		}

		if (!record.rule.active) {
			throw new Error("A regra de fidelidade está inativa");
		}

		const [granted] = await this.grantRulesForCustomer(
			tenantId,
			customerId,
			[record],
			null,
		);

		if (!granted) {
			throw new Error("Este benefício já foi concedido para o cliente");
		}

		return granted;
	}

	private async grantRulesForCustomer(
		tenantId: string,
		customerId: string,
		rules: LoyaltyRuleRecord[],
		referralId: string | null,
	): Promise<GrantedRewardDTO[]> {
		const granted: GrantedRewardDTO[] = [];
		const grantedAt = new Date();

		for (const record of rules) {
			const loyaltyRuleId = record.rule.id as string;
			const alreadyGranted =
				await this.customerRewardsRepository.existsByGrantKey(
					tenantId,
					customerId,
					loyaltyRuleId,
					referralId,
				);

			if (alreadyGranted) {
				continue;
			}

			const reward = new CustomerReward({
				customerId,
				loyaltyRuleId,
				referralId,
				appointmentId: null,
				grantYear: null,
				status: "AVAILABLE",
				grantedAt,
				expiresAt: computeExpiresAt(grantedAt, record.rule.validDays),
				usedAt: null,
			});

			await this.customerRewardsRepository.save(tenantId, reward);
			granted.push(toGrantedRewardDTO(record, reward.id as string));
		}

		return granted;
	}

	async grantForNewReferral(
		tenantId: string,
		referral: Referral,
	): Promise<GrantedRewardDTO[]> {
		return this.grantReferralReceived(
			tenantId,
			referral.referredId,
			referral.id as string,
		);
	}

	async grantForConvertedReferrals(
		tenantId: string,
		referrals: Referral[],
	): Promise<GrantedRewardDTO[]> {
		const granted: GrantedRewardDTO[] = [];

		for (const referral of referrals) {
			const items = await this.grantReferralGiven(
				tenantId,
				referral.referrerId,
				referral.id as string,
			);
			granted.push(...items);
		}

		return granted;
	}
}
