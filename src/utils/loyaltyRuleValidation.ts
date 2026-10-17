import {
	LOYALTY_REWARD_TYPES,
	LOYALTY_TRIGGER_TYPES,
	type LoyaltyRewardType,
	type LoyaltyTriggerType,
} from "@/entities/LoyaltyRule";

export interface LoyaltyRuleInput {
	name: string;
	description?: string | null;
	triggerType: LoyaltyTriggerType;
	visitCount?: number | null;
	rewardType: LoyaltyRewardType;
	rewardValue?: number | null;
	freeServiceId?: string | null;
	validDays?: number | null;
}

export interface NormalizedLoyaltyRuleInput {
	name: string;
	description: string | null;
	triggerType: LoyaltyTriggerType;
	visitCount: number | null;
	rewardType: LoyaltyRewardType;
	rewardValue: number | null;
	freeServiceId: string | null;
	validDays: number | null;
}

export function validateLoyaltyRuleInput(data: LoyaltyRuleInput): void {
	const name = data.name?.trim();

	if (!name) {
		throw new Error("Nome é obrigatório");
	}

	if (name.length > 100) {
		throw new Error("Nome inválido");
	}

	if (!LOYALTY_TRIGGER_TYPES.includes(data.triggerType)) {
		throw new Error("Gatilho inválido");
	}

	if (!LOYALTY_REWARD_TYPES.includes(data.rewardType)) {
		throw new Error("Recompensa inválida");
	}

	if (data.triggerType === "VISIT_COUNT") {
		if (
			data.visitCount == null ||
			!Number.isInteger(data.visitCount) ||
			data.visitCount < 2
		) {
			throw new Error(
				"Informe em qual visita o benefício será concedido (mínimo 2)",
			);
		}
	}

	if (data.rewardType === "PERCENT_DISCOUNT") {
		if (
			data.rewardValue == null ||
			data.rewardValue < 0 ||
			data.rewardValue > 100
		) {
			throw new Error("Informe um percentual de desconto entre 0 e 100");
		}
	}

	if (data.rewardType === "FIXED_DISCOUNT") {
		if (data.rewardValue == null || data.rewardValue <= 0) {
			throw new Error("Informe um valor de desconto maior que zero");
		}
	}

	if (data.rewardType === "FREE_SERVICE") {
		if (!data.freeServiceId?.trim()) {
			throw new Error("Selecione o serviço grátis");
		}
	}

	if (
		data.validDays != null &&
		(!Number.isInteger(data.validDays) || data.validDays <= 0)
	) {
		throw new Error("Validade inválida");
	}
}

export function normalizeLoyaltyRuleInput(
	data: LoyaltyRuleInput,
): NormalizedLoyaltyRuleInput {
	const name = data.name.trim();

	return {
		name,
		description: data.description?.trim() ? data.description.trim() : null,
		triggerType: data.triggerType,
		visitCount:
			data.triggerType === "VISIT_COUNT" ? (data.visitCount ?? null) : null,
		rewardType: data.rewardType,
		rewardValue:
			data.rewardType === "FREE_SERVICE" ? null : (data.rewardValue ?? null),
		freeServiceId:
			data.rewardType === "FREE_SERVICE"
				? (data.freeServiceId?.trim() ?? null)
				: null,
		validDays: data.validDays ?? null,
	};
}
