import type { CustomerRewardListItem } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { CustomerRewardUsageService } from "@/services/CustomerRewardUsageService";

export async function syncAppointmentCustomerReward(params: {
	appointmentId: string;
	previousReward: CustomerRewardListItem | null;
	nextReward: CustomerRewardListItem | null;
	customerRewardsRepository: ICustomerRewardsRepository;
	rewardUsageService: CustomerRewardUsageService;
	now: Date;
}): Promise<void> {
	const previousId = params.previousReward?.reward.id ?? null;
	const nextId = params.nextReward?.reward.id ?? null;

	if (previousId && previousId !== nextId && params.previousReward) {
		params.rewardUsageService.releaseFromAppointment(
			params.previousReward.reward,
			params.now,
		);
		await params.customerRewardsRepository.update(params.previousReward.reward);
	}

	if (nextId && nextId !== previousId && params.nextReward) {
		params.rewardUsageService.markAsUsed(
			params.nextReward.reward,
			params.appointmentId,
			params.now,
		);
		await params.customerRewardsRepository.update(params.nextReward.reward);
	}
}
