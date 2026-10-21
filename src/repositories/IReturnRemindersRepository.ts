export interface ReturnReminderCandidate {
	appointmentItemId: string;
	customerId: string;
	customerName: string;
	serviceName: string;
	appointmentDate: string;
	returnDueDate: string;
}

export interface OverdueReturnListItem {
	appointmentItemId: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	serviceName: string;
	appointmentDate: string;
	returnDueDate: string;
	additionalServicesCount: number;
}

export interface ListOverdueReturnsResult {
	items: OverdueReturnListItem[];
	total: number;
}

export interface IReturnRemindersRepository {
	listEligibleForReminders(
		asOfDate: string,
		maxOverdueDays: number,
	): Promise<ReturnReminderCandidate[]>;
	listOverdueWithoutContactAfterAppointment(
		asOfDate: string,
		page: number,
		perPage: number,
	): Promise<ListOverdueReturnsResult>;
	findNextSuggestedReturnDueDate(
		customerId: string,
		asOfDate: string,
	): Promise<string | null>;
}
