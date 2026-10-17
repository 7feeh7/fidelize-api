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

function computeExpiresAt(grantedAt: Date, validDays: number | null): Date | null {
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
		customerId: string,
	): Promise<GrantedRewardDTO[]> {
		const rules =
			await this.loyaltyRulesRepository.listActiveByTriggerType("FIRST_VISIT");

		return this.grantRulesForCustomer(customerId, rules, null);
	}

	async grantReferralReceived(
		customerId: string,
		referralId: string,
	): Promise<GrantedRewardDTO[]> {
		const rules =
			await this.loyaltyRulesRepository.listActiveByTriggerType(
				"REFERRAL_RECEIVED",
			);

		return this.grantRulesForCustomer(customerId, rules, referralId);
	}

	async grantReferralGiven(
		referrerId: string,
		referralId: string,
	): Promise<GrantedRewardDTO[]> {
		const rules =
			await this.loyaltyRulesRepository.listActiveByTriggerType("REFERRAL_GIVEN");

		return this.grantRulesForCustomer(referrerId, rules, referralId);
	}

	async grantVisitCount(
		customerId: string,
		appointmentCount: number,
	): Promise<GrantedRewardDTO[]> {
		const rules =
			await this.loyaltyRulesRepository.listActiveByTriggerType("VISIT_COUNT");

		const matchingRules = rules.filter(
			(record) =>
				record.rule.visitCount != null &&
				record.rule.visitCount - 1 === appointmentCount,
		);

		return this.grantRulesForCustomer(customerId, matchingRules, null);
	}

	async grantManual(
		customerId: string,
		loyaltyRuleId: string,
	): Promise<GrantedRewardDTO> {
		const record = await this.loyaltyRulesRepository.findById(loyaltyRuleId);

		if (!record) {
			throw new Error("Regra de fidelidade não encontrada");
		}

		if (!record.rule.active) {
			throw new Error("A regra de fidelidade está inativa");
		}

		const [granted] = await this.grantRulesForCustomer(
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
				status: "AVAILABLE",
				grantedAt,
				expiresAt: computeExpiresAt(grantedAt, record.rule.validDays),
				usedAt: null,
			});

			await this.customerRewardsRepository.save(reward);
			granted.push(toGrantedRewardDTO(record, reward.id as string));
		}

		return granted;
	}

	async grantForNewReferral(referral: Referral): Promise<GrantedRewardDTO[]> {
		return this.grantReferralReceived(referral.referredId, referral.id as string);
	}

	async grantForConvertedReferrals(
		referrals: Referral[],
	): Promise<GrantedRewardDTO[]> {
		const granted: GrantedRewardDTO[] = [];

		for (const referral of referrals) {
			const items = await this.grantReferralGiven(
				referral.referrerId,
				referral.id as string,
			);
			granted.push(...items);
		}

		return granted;
	}
}
