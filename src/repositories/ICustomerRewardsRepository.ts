import type {
	CustomerReward,
	CustomerRewardStatus,
} from "@/entities/CustomerReward";

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

export interface ListCustomerRewardsParams {
	customerId: string;
	status?: CustomerRewardStatus;
	page?: number;
	perPage?: number;
}

export interface ListCustomerRewardsResult {
	items: CustomerRewardListItem[];
	total: number;
}

export interface ICustomerRewardsRepository {
	save(tenantId: string, reward: CustomerReward): Promise<void>;
	existsByGrantKey(
		tenantId: string,
		customerId: string,
		loyaltyRuleId: string,
		referralId: string | null,
	): Promise<boolean>;
	existsBirthdayGrantForYear(
		tenantId: string,
		customerId: string,
		loyaltyRuleId: string,
		grantYear: number,
	): Promise<boolean>;
	findById(tenantId: string, id: string): Promise<CustomerReward | null>;
	findDetailById(
		tenantId: string,
		id: string,
	): Promise<CustomerRewardListItem | null>;
	findUsedDetailByAppointmentId(
		tenantId: string,
		appointmentId: string,
	): Promise<CustomerRewardListItem | null>;
	expireAvailablePastDue(
		tenantId: string,
		referenceDate: Date,
	): Promise<number>;
	listByCustomerId(
		tenantId: string,
		params: ListCustomerRewardsParams,
	): Promise<ListCustomerRewardsResult>;
	listAvailableExpiringWithinDays(
		tenantId: string,
		customerId: string,
		referenceDate: Date,
		withinDays: number,
	): Promise<CustomerRewardListItem[]>;
	findSoonestExpiringAvailable(
		tenantId: string,
		customerId: string,
	): Promise<CustomerRewardListItem | null>;
	update(tenantId: string, reward: CustomerReward): Promise<void>;
}
