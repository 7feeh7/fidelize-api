import type { Customer } from "@/entities/Customer";

export interface ListCustomersParams {
	page: number;
	perPage: number;
	search?: string;
}

export interface CustomerListRecord {
	customer: Customer;
	referrerId: string | null;
	referrerName: string | null;
	referralsMadeCount: number;
}

export type CustomerProfileRecord = CustomerListRecord;

export interface ListCustomersResult {
	items: CustomerListRecord[];
	total: number;
}

export interface ICustomersRepository {
	save(customer: Customer): Promise<void>;
	findByPhone(phone: string): Promise<Customer | null>;
	findActiveById(id: string): Promise<Customer | null>;
	findActiveProfileById(id: string): Promise<CustomerProfileRecord | null>;
	list(params: ListCustomersParams): Promise<ListCustomersResult>;
	update(customer: Customer): Promise<void>;
	deactivate(id: string): Promise<void>;
}
