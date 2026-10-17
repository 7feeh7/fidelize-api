import type {
	LoyaltyRewardType,
	LoyaltyTriggerType,
} from "@/entities/LoyaltyRule";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

function formatPercent(value: number): string {
	return Number.isInteger(value) ? String(value) : String(value);
}

export function formatLoyaltyRuleRewardSummary(params: {
	rewardType: LoyaltyRewardType;
	rewardValue: number | null;
	freeServiceName?: string | null;
}): string {
	switch (params.rewardType) {
		case "PERCENT_DISCOUNT":
			return `${formatPercent(params.rewardValue ?? 0)}% de desconto`;
		case "FIXED_DISCOUNT":
			return `${currencyFormatter.format(params.rewardValue ?? 0)} de desconto`;
		case "FREE_SERVICE":
			return params.freeServiceName
				? `${params.freeServiceName} grátis`
				: "Serviço grátis";
	}
}

export function formatLoyaltyRuleTriggerLabel(
	triggerType: LoyaltyTriggerType,
	visitCount: number | null,
): string {
	switch (triggerType) {
		case "FIRST_VISIT":
			return "Primeira visita";
		case "VISIT_COUNT":
			return visitCount ? `${visitCount}ª visita` : "Número de visitas";
		case "REFERRAL_GIVEN":
			return "Indicação feita";
		case "REFERRAL_RECEIVED":
			return "Indicação recebida";
		case "BIRTHDAY":
			return "Aniversário";
	}
}

function formatLoyaltyRuleTriggerPreview(
	triggerType: LoyaltyTriggerType,
	visitCount: number | null,
): string {
	switch (triggerType) {
		case "FIRST_VISIT":
			return "Na primeira visita";
		case "VISIT_COUNT":
			return visitCount ? `Na ${visitCount}ª visita` : "Na visita indicada";
		case "REFERRAL_GIVEN":
			return "Quando o cliente indicar alguém";
		case "REFERRAL_RECEIVED":
			return "Quando o cliente for indicado";
		case "BIRTHDAY":
			return "No aniversário do cliente";
	}
}

export function formatLoyaltyRulePreview(params: {
	triggerType: LoyaltyTriggerType;
	visitCount: number | null;
	rewardType: LoyaltyRewardType;
	rewardValue: number | null;
	freeServiceName?: string | null;
	validDays: number | null;
}): string {
	const triggerPart = formatLoyaltyRuleTriggerPreview(
		params.triggerType,
		params.visitCount,
	);
	const rewardPart = formatLoyaltyRuleRewardSummary({
		rewardType: params.rewardType,
		rewardValue: params.rewardValue,
		freeServiceName: params.freeServiceName,
	});

	let preview = `${triggerPart}, o cliente ganha ${rewardPart}`;

	if (params.validDays != null) {
		preview += `, válida por ${params.validDays} dias`;
	}

	return preview;
}

export interface LoyaltyRulePresentationInput {
	triggerType: LoyaltyTriggerType;
	visitCount: number | null;
	rewardType: LoyaltyRewardType;
	rewardValue: number | null;
	freeServiceName: string | null;
	validDays: number | null;
}

export function buildLoyaltyRulePresentation(
	input: LoyaltyRulePresentationInput,
) {
	const rewardSummary = formatLoyaltyRuleRewardSummary({
		rewardType: input.rewardType,
		rewardValue: input.rewardValue,
		freeServiceName: input.freeServiceName,
	});

	const triggerLabel = formatLoyaltyRuleTriggerLabel(
		input.triggerType,
		input.visitCount,
	);

	const preview = formatLoyaltyRulePreview({
		triggerType: input.triggerType,
		visitCount: input.visitCount,
		rewardType: input.rewardType,
		rewardValue: input.rewardValue,
		freeServiceName: input.freeServiceName,
		validDays: input.validDays,
	});

	return { rewardSummary, triggerLabel, preview };
}
