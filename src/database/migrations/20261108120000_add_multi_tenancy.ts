import type { Knex } from "knex";

const TENANT_TABLES = [
	"users",
	"customers",
	"services",
	"appointments",
	"appointment_items",
	"referrals",
	"loyalty_rules",
	"customer_rewards",
	"message_templates",
	"messages",
];

const PARENT_TABLES = TENANT_TABLES.filter((table) => table !== "messages");

interface TenantForeignKey {
	table: string;
	column: string;
	parent: string;
	onDelete?: "CASCADE";
}

const TENANT_FOREIGN_KEYS: TenantForeignKey[] = [
	{ table: "appointments", column: "customer_id", parent: "customers" },
	{ table: "appointments", column: "user_id", parent: "users" },
	{
		table: "appointment_items",
		column: "appointment_id",
		parent: "appointments",
		onDelete: "CASCADE",
	},
	{ table: "appointment_items", column: "service_id", parent: "services" },
	{ table: "referrals", column: "referrer_id", parent: "customers" },
	{ table: "referrals", column: "referred_id", parent: "customers" },
	{ table: "loyalty_rules", column: "free_service_id", parent: "services" },
	{ table: "customer_rewards", column: "customer_id", parent: "customers" },
	{
		table: "customer_rewards",
		column: "loyalty_rule_id",
		parent: "loyalty_rules",
	},
	{ table: "customer_rewards", column: "referral_id", parent: "referrals" },
	{
		table: "customer_rewards",
		column: "appointment_id",
		parent: "appointments",
	},
	{ table: "messages", column: "customer_id", parent: "customers" },
	{ table: "messages", column: "template_id", parent: "message_templates" },
	{
		table: "messages",
		column: "customer_reward_id",
		parent: "customer_rewards",
	},
	{ table: "messages", column: "sent_by", parent: "users" },
];

function readRequiredEnv(name: string): string {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
	}

	return value;
}

async function hasExistingUsers(knex: Knex): Promise<boolean> {
	const user = await knex("users").select("id").first();

	return Boolean(user);
}

export async function up(knex: Knex): Promise<void> {
	// Com dados existentes, os valores vêm do ambiente porque o repositório é público.
	const hasUsers = await hasExistingUsers(knex);
	const firstTenantName = hasUsers
		? readRequiredEnv("FIRST_TENANT_NAME")
		: "Negócio local";
	const firstTenantSlug = hasUsers
		? readRequiredEnv("FIRST_TENANT_SLUG")
		: "negocio-local";
	const platformAdminEmail = hasUsers
		? readRequiredEnv("PLATFORM_ADMIN_EMAIL")
		: null;

	await knex.schema.createTable("tenants", (table) => {
		table.uuid("id").primary();
		table.string("name", 255).notNullable();
		table.string("slug", 60).notNullable().unique();
		table.string("timezone", 60).notNullable().defaultTo("America/Sao_Paulo");
		table.string("status", 20).notNullable().defaultTo("TRIAL");
		table.string("plan", 30).nullable();
		table.timestamp("trial_ends_at", { useTz: true }).nullable();
		table.text("logo_url").nullable();
		table.string("primary_color", 9).nullable();
		table.timestamps(true, true);
	});

	for (const tableName of TENANT_TABLES) {
		await knex.schema.alterTable(tableName, (table) => {
			table.uuid("tenant_id").nullable();
		});
	}

	await knex.schema.alterTable("users", (table) => {
		table.string("role", 30).nullable();
		table.timestamp("first_login_at", { useTz: true }).nullable();
	});

	const tenantId = crypto.randomUUID();

	await knex("tenants").insert({
		id: tenantId,
		name: firstTenantName,
		slug: firstTenantSlug,
		status: "ACTIVE",
	});

	for (const tableName of TENANT_TABLES) {
		await knex(tableName).update({ tenant_id: tenantId });
	}

	await knex("users").update({ role: "TENANT_ADMIN" });

	if (platformAdminEmail) {
		const promotedCount = await knex("users")
			.where({ email: platformAdminEmail })
			.update({ role: "PLATFORM_ADMIN" });

		if (promotedCount !== 1) {
			throw new Error("Usuário de PLATFORM_ADMIN_EMAIL não encontrado");
		}
	}

	for (const tableName of TENANT_TABLES) {
		await knex.schema.alterTable(tableName, (table) => {
			table.uuid("tenant_id").notNullable().alter();
			table.foreign("tenant_id").references("id").inTable("tenants");
		});
	}

	await knex.schema.alterTable("users", (table) => {
		table.string("role", 30).notNullable().alter();
	});

	await knex.schema.alterTable("customers", (table) => {
		table.dropUnique(["phone"]);
		table.unique(["tenant_id", "phone"]);
	});

	await knex.schema.alterTable("services", (table) => {
		table.dropUnique(["name"]);
		table.unique(["tenant_id", "name"]);
	});

	await knex.raw("DROP INDEX messages_status_scheduled_for_idx");
	await knex.raw(
		"CREATE INDEX messages_tenant_status_scheduled_for_idx ON messages (tenant_id, status, scheduled_for)",
	);

	for (const tableName of PARENT_TABLES) {
		await knex.schema.alterTable(tableName, (table) => {
			table.unique(["tenant_id", "id"]);
		});
	}

	for (const foreignKey of TENANT_FOREIGN_KEYS) {
		await knex.schema.alterTable(foreignKey.table, (table) => {
			table.dropForeign([foreignKey.column]);

			const composite = table
				.foreign(["tenant_id", foreignKey.column])
				.references(["tenant_id", "id"])
				.inTable(foreignKey.parent);

			if (foreignKey.onDelete) {
				composite.onDelete(foreignKey.onDelete);
			}
		});
	}

	// O SET NULL precisa limitar a coluna: sem isso, anularia também o tenant_id.
	await knex.schema.alterTable("messages", (table) => {
		table.dropForeign(["appointment_item_id"]);
	});
	await knex.raw(`
		ALTER TABLE messages
		ADD CONSTRAINT messages_tenant_id_appointment_item_id_foreign
		FOREIGN KEY (tenant_id, appointment_item_id)
		REFERENCES appointment_items (tenant_id, id)
		ON DELETE SET NULL (appointment_item_id)
	`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable("messages", (table) => {
		table.dropForeign(["tenant_id", "appointment_item_id"]);
		table
			.foreign("appointment_item_id")
			.references("id")
			.inTable("appointment_items")
			.onDelete("SET NULL");
	});

	for (const foreignKey of TENANT_FOREIGN_KEYS) {
		await knex.schema.alterTable(foreignKey.table, (table) => {
			table.dropForeign(["tenant_id", foreignKey.column]);

			const simple = table
				.foreign(foreignKey.column)
				.references("id")
				.inTable(foreignKey.parent);

			if (foreignKey.onDelete) {
				simple.onDelete(foreignKey.onDelete);
			}
		});
	}

	for (const tableName of PARENT_TABLES) {
		await knex.schema.alterTable(tableName, (table) => {
			table.dropUnique(["tenant_id", "id"]);
		});
	}

	await knex.raw("DROP INDEX messages_tenant_status_scheduled_for_idx");
	await knex.raw(
		"CREATE INDEX messages_status_scheduled_for_idx ON messages (status, scheduled_for)",
	);

	await knex.schema.alterTable("services", (table) => {
		table.dropUnique(["tenant_id", "name"]);
		table.unique(["name"]);
	});

	await knex.schema.alterTable("customers", (table) => {
		table.dropUnique(["tenant_id", "phone"]);
		table.unique(["phone"]);
	});

	await knex.schema.alterTable("users", (table) => {
		table.dropColumn("role");
		table.dropColumn("first_login_at");
	});

	for (const tableName of TENANT_TABLES) {
		await knex.schema.alterTable(tableName, (table) => {
			table.dropForeign(["tenant_id"]);
			table.dropColumn("tenant_id");
		});
	}

	await knex.schema.dropTable("tenants");
}
