export interface IGetIndicatorsRequestDTO {
	startDate?: string;
	endDate?: string;
}

export interface IGetIndicatorsResponseDTO {
	startDate: string;
	endDate: string;
	appointmentsCount: number;
	billedAmount: number;
	newCustomersCount: number;
	convertedReferralsCount: number;
}
