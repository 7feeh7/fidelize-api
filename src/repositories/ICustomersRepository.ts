import type { Customer } from "@/entities/Customer";

export interface ListCustomersParams {
	page: number;
	perPage: number;
	search?: string;
}

export interface ListCustomersResult {
	items: Customer[];
	total: number;
}

export interface ICustomersRepository {
	save(customer: Customer): Promise<void>;
	findByPhone(phone: string): Promise<Customer | null>;
	list(params: ListCustomersParams): Promise<ListCustomersResult>;
}
