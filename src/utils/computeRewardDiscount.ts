import type { LoyaltyRewardType } from "@/entities/LoyaltyRule";
import { roundMoney } from "@/utils/appointmentCalculations";

export interface RewardDiscountInput {
	rewardType: LoyaltyRewardType;
	rewardValue: number | null;
	freeServiceId: string | null;
	subtotal: number;
	itemServiceIds: string[];
	itemPricesByServiceId: Map<string, number>;
}

export function computeRewardDiscount(input: RewardDiscountInput): number {
	const { rewardType, subtotal } = input;

	if (subtotal <= 0) {
		return 0;
	}

	switch (rewardType) {
		case "PERCENT_DISCOUNT": {
			if (input.rewardValue == null || input.rewardValue <= 0) {
				throw new Error("Benefício com percentual inválido");
			}
			return roundMoney(subtotal * (input.rewardValue / 100));
		}
		case "FIXED_DISCOUNT": {
			if (input.rewardValue == null || input.rewardValue <= 0) {
				throw new Error("Benefício com valor fixo inválido");
			}
			return roundMoney(Math.min(input.rewardValue, subtotal));
		}
		case "FREE_SERVICE": {
			if (!input.freeServiceId) {
				throw new Error("Benefício de serviço grátis sem serviço configurado");
			}

			const matchingServiceIds = input.itemServiceIds.filter(
				(serviceId) => serviceId === input.freeServiceId,
			);

			if (matchingServiceIds.length === 0) {
				throw new Error(
					"O serviço gratuito do benefício não está entre os itens do atendimento",
				);
			}

			const price = input.itemPricesByServiceId.get(input.freeServiceId);

			if (price == null) {
				throw new Error(
					"O serviço gratuito do benefício não está entre os itens do atendimento",
				);
			}

			return roundMoney(Math.min(price, subtotal));
		}
		default:
			throw new Error("Tipo de benefício não suportado");
	}
}
