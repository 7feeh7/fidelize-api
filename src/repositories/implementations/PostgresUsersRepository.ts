import type { Knex } from "knex";
import { User } from "@/entities/User";
import type { IUsersRepository } from "../IUsersRepository";

export class PostgresUsersRepository implements IUsersRepository {
	constructor(private connection: Knex) {}

	async save(user: User): Promise<void> {
		await this.connection("users").insert({
			id: user.id,
			name: user.name,
			email: user.email,
			password: user.password,
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		const row = await this.connection("users").where({ email }).first();

		if (!row) {
			return null;
		}

		return new User(
			{ name: row.name, email: row.email, password: row.password },
			row.id,
		);
	}

	async findById(id: string): Promise<User | null> {
		const row = await this.connection("users").where({ id }).first();

		if (!row) {
			return null;
		}

		return new User(
			{ name: row.name, email: row.email, password: row.password },
			row.id,
		);
	}

	async listAll() {
		const rows = await this.connection("users")
			.select("id", "name")
			.orderBy("name", "asc");

		return rows.map((row) => ({
			id: row.id as string,
			name: row.name as string,
		}));
	}
}
