import type { CustomerRewardListItem } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type {
	AppointmentRewardItem,
	CustomerRewardUsageService,
} from "@/services/CustomerRewardUsageService";
import { normalizeDiscountAmount } from "@/utils/prepareAppointmentItems";

export interface ResolveAppointmentCustomerRewardParams {
	customerRewardId?: string | null;
	customerId: string;
	appointmentId?: string;
	subtotal: number;
	items: AppointmentRewardItem[];
	discountAmount?: number;
	notes?: string | null;
	customerRewardsRepository: ICustomerRewardsRepository;
	rewardUsageService: CustomerRewardUsageService;
	now?: Date;
}

export interface ResolvedAppointmentCustomerReward {
	rewardItem: CustomerRewardListItem | null;
	discountAmount: number;
}

function assertRewardForAppointment(
	rewardUsageService: CustomerRewardUsageService,
	rewardItem: CustomerRewardListItem,
	customerId: string,
	appointmentId: string | undefined,
	now: Date,
): void {
	const { reward } = rewardItem;

	if (
		reward.status === "USED" &&
		appointmentId &&
		reward.appointmentId === appointmentId
	) {
		if (reward.customerId !== customerId) {
			throw new Error("O benefício não pertence a este cliente");
		}

		if (reward.expiresAt && reward.expiresAt.getTime() < now.getTime()) {
			throw new Error("O benefício está vencido");
		}

		return;
	}

	rewardUsageService.assertRewardCanBeApplied(rewardItem, customerId, now);
}

export async function resolveAppointmentCustomerReward(
	params: ResolveAppointmentCustomerRewardParams,
): Promise<ResolvedAppointmentCustomerReward> {
	const customerRewardId = params.customerRewardId?.trim() || null;
	const requestedDiscount = normalizeDiscountAmount(params.discountAmount);
	const now = params.now ?? new Date();

	if (!customerRewardId) {
		return {
			rewardItem: null,
			discountAmount: requestedDiscount,
		};
	}

	const rewardItem =
		await params.customerRewardsRepository.findDetailById(customerRewardId);

	if (!rewardItem) {
		throw new Error("Benefício não encontrado");
	}

	assertRewardForAppointment(
		params.rewardUsageService,
		rewardItem,
		params.customerId,
		params.appointmentId,
		now,
	);

	const rewardDiscount = params.rewardUsageService.computeDiscountForReward(
		rewardItem,
		params.subtotal,
		params.items,
	);

	const discountAmount = params.rewardUsageService.resolveDiscountAmount({
		customerRewardId,
		rewardDiscount,
		requestedDiscount,
		notes: params.notes,
	});

	return {
		rewardItem,
		discountAmount,
	};
}
