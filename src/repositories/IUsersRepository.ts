import type { User } from "@/entities/User";

export interface UserListItem {
	id: string;
	name: string;
}

export interface IUsersRepository {
	save(user: User): Promise<void>;
	update(tenantId: string, user: User): Promise<void>;
	markFirstLogin(tenantId: string, id: string): Promise<void>;
	findByEmail(email: string): Promise<User | null>;
	findById(tenantId: string, id: string): Promise<User | null>;
	listAll(tenantId: string): Promise<UserListItem[]>;
}
