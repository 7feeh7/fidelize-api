export interface IListMonthlyBirthdaysRequestDTO {
	year?: number;
	month?: number;
}

export interface MonthlyBirthdayItemDTO {
	id: string;
	name: string;
	phone: string;
	dateOfBirth: string;
	age: number;
}

export interface IListMonthlyBirthdaysResponseDTO {
	year: number;
	month: number;
	data: MonthlyBirthdayItemDTO[];
}
