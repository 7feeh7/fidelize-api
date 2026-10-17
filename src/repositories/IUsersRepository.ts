import type { User } from "@/entities/User";

export interface UserListItem {
	id: string;
	name: string;
}

export interface IUsersRepository {
	save(user: User): Promise<void>;
	findByEmail(email: string): Promise<User | null>;
	findById(id: string): Promise<User | null>;
	listAll(): Promise<UserListItem[]>;
}
