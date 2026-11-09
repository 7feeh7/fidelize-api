import type { Knex } from "knex";
import { User, type UserRole } from "@/entities/User";
import type { IUsersRepository } from "../IUsersRepository";

function mapRowToUser(row: Record<string, unknown>): User {
	return new User(
		{
			tenantId: row.tenant_id as string,
			role: row.role as UserRole,
			name: row.name as string,
			email: row.email as string,
			password: row.password as string,
			firstLoginAt: row.first_login_at
				? new Date(row.first_login_at as string)
				: null,
		},
		row.id as string,
	);
}

export class PostgresUsersRepository implements IUsersRepository {
	constructor(private connection: Knex) {}

	async save(user: User): Promise<void> {
		await this.connection("users").insert({
			id: user.id,
			tenant_id: user.tenantId,
			role: user.role,
			name: user.name,
			email: user.email,
			password: user.password,
		});
	}

	async update(tenantId: string, user: User): Promise<void> {
		await this.connection("users")
			.where({ tenant_id: tenantId, id: user.id })
			.update({
				name: user.name,
				email: user.email,
				password: user.password,
			});
	}

	async markFirstLogin(tenantId: string, id: string): Promise<void> {
		await this.connection("users")
			.where({ tenant_id: tenantId, id })
			.whereNull("first_login_at")
			.update({ first_login_at: this.connection.fn.now() });
	}

	// Global de propósito: o login descobre o negócio a partir do e-mail.
	async findByEmail(email: string): Promise<User | null> {
		const row = await this.connection("users").where({ email }).first();

		return row ? mapRowToUser(row) : null;
	}

	async findById(tenantId: string, id: string): Promise<User | null> {
		const row = await this.connection("users")
			.where({ tenant_id: tenantId, id })
			.first();

		return row ? mapRowToUser(row) : null;
	}

	async listAll(tenantId: string) {
		const rows = await this.connection("users")
			.where({ tenant_id: tenantId })
			.select("id", "name")
			.orderBy("name", "asc");

		return rows.map((row) => ({
			id: row.id as string,
			name: row.name as string,
		}));
	}
}
