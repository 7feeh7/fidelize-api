export interface IUpdateServiceRequestDTO {
	id: string;
	name: string;
	description?: string | null;
	price: number;
	durationMinutes?: number | null;
	suggestedReturnDays?: number | null;
	active: boolean;
}
