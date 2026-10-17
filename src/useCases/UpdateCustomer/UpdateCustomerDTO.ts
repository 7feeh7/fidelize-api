import type { LeadSource } from "@/entities/Customer";

export interface IUpdateCustomerRequestDTO {
	id: string;
	name: string;
	phone: string;
	dateOfBirth?: string | null;
	leadSource: LeadSource;
	referrerId?: string;
}
