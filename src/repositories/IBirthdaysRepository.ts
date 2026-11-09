export interface BirthdayCustomerRecord {
	customerId: string;
	customerName: string;
	customerPhone: string;
	dateOfBirth: string;
}

export interface IBirthdaysRepository {
	listCandidatesForDate(
		tenantId: string,
		asOfDate: string,
	): Promise<BirthdayCustomerRecord[]>;
	listInMonth(
		tenantId: string,
		year: number,
		month: number,
	): Promise<BirthdayCustomerRecord[]>;
}
