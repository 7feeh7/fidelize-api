import type { CustomerReward, CustomerRewardStatus } from "@/entities/CustomerReward";

export interface CustomerRewardListItem {
	reward: CustomerReward;
	ruleName: string;
	triggerType: string;
	visitCount: number | null;
	rewardType: string;
	rewardValue: number | null;
	freeServiceId: string | null;
	freeServiceName: string | null;
	validDays: number | null;
}

export interface ICustomerRewardsRepository {
	save(reward: CustomerReward): Promise<void>;
	existsByGrantKey(
		customerId: string,
		loyaltyRuleId: string,
		referralId: string | null,
	): Promise<boolean>;
	existsBirthdayGrantForYear(
		customerId: string,
		loyaltyRuleId: string,
		grantYear: number,
	): Promise<boolean>;
	findById(id: string): Promise<CustomerReward | null>;
	findDetailById(id: string): Promise<CustomerRewardListItem | null>;
	findUsedDetailByAppointmentId(
		appointmentId: string,
	): Promise<CustomerRewardListItem | null>;
	expireAvailablePastDue(referenceDate: Date): Promise<number>;
	listByCustomerId(
		customerId: string,
		status?: CustomerRewardStatus,
	): Promise<CustomerRewardListItem[]>;
	findSoonestExpiringAvailable(
		customerId: string,
	): Promise<CustomerRewardListItem | null>;
	update(reward: CustomerReward): Promise<void>;
}
