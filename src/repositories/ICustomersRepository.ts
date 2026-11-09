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
	save(tenantId: string, customer: Customer): Promise<void>;
	findByPhone(tenantId: string, phone: string): Promise<Customer | null>;
	findActiveById(tenantId: string, id: string): Promise<Customer | null>;
	findActiveProfileById(
		tenantId: string,
		id: string,
	): Promise<CustomerProfileRecord | null>;
	list(
		tenantId: string,
		params: ListCustomersParams,
	): Promise<ListCustomersResult>;
	update(tenantId: string, customer: Customer): Promise<void>;
	deactivate(tenantId: string, id: string): Promise<void>;
}
