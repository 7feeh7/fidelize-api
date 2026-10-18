import type { CustomerReward } from "@/entities/CustomerReward";
import type { LoyaltyRewardType } from "@/entities/LoyaltyRule";
import type { CustomerRewardListItem } from "@/repositories/ICustomerRewardsRepository";
import { roundMoney } from "@/utils/appointmentCalculations";
import { computeRewardDiscount } from "@/utils/computeRewardDiscount";

export interface AppointmentRewardItem {
	serviceId: string;
	price: number;
}

export class CustomerRewardUsageService {
	assertRewardCanBeApplied(
		rewardItem: CustomerRewardListItem,
		customerId: string,
		now: Date,
	): void {
		const { reward } = rewardItem;

		if (reward.customerId !== customerId) {
			throw new Error("O benefício não pertence a este cliente");
		}

		if (reward.status !== "AVAILABLE") {
			throw new Error("O benefício não está disponível para uso");
		}

		if (reward.expiresAt && reward.expiresAt.getTime() < now.getTime()) {
			throw new Error("O benefício está vencido");
		}
	}

	computeDiscountForReward(
		rewardItem: CustomerRewardListItem,
		subtotal: number,
		items: AppointmentRewardItem[],
	): number {
		const pricesByServiceId = new Map<string, number>();

		for (const item of items) {
			pricesByServiceId.set(item.serviceId, item.price);
		}

		return computeRewardDiscount({
			rewardType: rewardItem.rewardType as LoyaltyRewardType,
			rewardValue: rewardItem.rewardValue,
			freeServiceId: rewardItem.freeServiceId,
			subtotal,
			itemServiceIds: items.map((item) => item.serviceId),
			itemPricesByServiceId: pricesByServiceId,
		});
	}

	resolveDiscountAmount(params: {
		customerRewardId?: string | null;
		rewardDiscount: number | null;
		requestedDiscount: number;
		notes?: string | null;
	}): number {
		const requestedDiscount = roundMoney(params.requestedDiscount);

		if (!params.customerRewardId?.trim()) {
			return requestedDiscount;
		}

		if (params.rewardDiscount == null) {
			throw new Error("Benefício inválido");
		}

		const expectedDiscount = roundMoney(params.rewardDiscount);

		if (requestedDiscount !== expectedDiscount && !params.notes?.trim()) {
			throw new Error("Informe observações ao alterar o desconto do benefício");
		}

		return requestedDiscount;
	}

	markAsUsed(
		reward: CustomerReward,
		appointmentId: string,
		usedAt: Date,
	): void {
		reward.status = "USED";
		reward.appointmentId = appointmentId;
		reward.usedAt = usedAt;
	}

	releaseFromAppointment(reward: CustomerReward, now: Date): void {
		reward.appointmentId = null;
		reward.usedAt = null;

		if (reward.expiresAt && reward.expiresAt.getTime() < now.getTime()) {
			reward.status = "EXPIRED";
			return;
		}

		reward.status = "AVAILABLE";
	}
}
