import type { Customer } from "@/entities/Customer";

export interface ICustomersRepository {
	save(customer: Customer): Promise<void>;
	findByPhone(phone: string): Promise<Customer | null>;
}
