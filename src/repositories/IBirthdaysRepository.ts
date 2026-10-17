export interface BirthdayCustomerRecord {
	customerId: string;
	customerName: string;
	customerPhone: string;
	dateOfBirth: string;
}

export interface IBirthdaysRepository {
	listCandidatesForDate(asOfDate: string): Promise<BirthdayCustomerRecord[]>;
	listInMonth(year: number, month: number): Promise<BirthdayCustomerRecord[]>;
}
