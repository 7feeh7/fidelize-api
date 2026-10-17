export interface ReturnReminderCandidate {
	appointmentItemId: string;
	customerId: string;
	customerName: string;
	serviceName: string;
	appointmentDate: string;
	returnDueDate: string;
}

export interface IReturnRemindersRepository {
	listEligibleForReminders(
		asOfDate: string,
		maxOverdueDays: number,
	): Promise<ReturnReminderCandidate[]>;
	findNextSuggestedReturnDueDate(
		customerId: string,
		asOfDate: string,
	): Promise<string | null>;
}
