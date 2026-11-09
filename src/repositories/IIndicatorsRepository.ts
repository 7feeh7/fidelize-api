export interface IndicatorsTotals {
	appointmentsCount: number;
	billedAmount: number;
	newCustomersCount: number;
	convertedReferralsCount: number;
}

export interface IIndicatorsRepository {
	getTotals(
		tenantId: string,
		startDate: string,
		endDate: string,
	): Promise<IndicatorsTotals>;
}
