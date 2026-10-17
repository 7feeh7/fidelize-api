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
}
