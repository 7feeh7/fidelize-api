export interface IRunDailyRoutineResponseDTO {
	expireCustomerRewards: {
		expiredCount: number;
		executedAt: string;
	};
	returnReminders: {
		generatedCount: number;
		skippedNoActiveTemplate: boolean;
		executedAt: string;
	};
	birthdays: {
		generatedCount: number;
		grantedCount: number;
		skippedNoActiveTemplate: boolean;
		skippedNoActiveRule: boolean;
		executedAt: string;
	};
}
