import type { LeadSource } from "@/entities/Customer";

export interface ICreateCustomerRequestDTO {
	name: string;
	phone: string;
	dateOfBirth?: string | null;
	leadSource: LeadSource;
}
