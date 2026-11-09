import knex, { type Knex } from "knex";
// @ts-expect-error: o Knex não publica tipos para o cliente interno do Postgres
import ClientPG from "knex/lib/dialects/postgres/index.js";

export interface CapturedQuery {
	sql: string;
	bindings: unknown[];
}

// Valores genéricos para os repositórios percorrerem todas as queries de cada método.
const DEFAULT_ROW = {
	id: "row-id",
	count: "1",
	total: "1",
	appointment_date: "2026-01-01T00:00:00.000Z",
	granted_at: "2026-01-01T00:00:00.000Z",
	created_at: "2026-01-01T00:00:00.000Z",
	date_of_birth: "1990-01-01",
	return_due_date: "2026-01-01",
};

const TRANSACTION_CONTROL = /^(BEGIN|COMMIT|ROLLBACK)\b/i;

export function createCaptureKnex(): {
	db: Knex;
	captured: CapturedQuery[];
} {
	const captured: CapturedQuery[] = [];

	class CaptureClient extends ClientPG {
		acquireConnection() {
			return Promise.resolve({});
		}

		releaseConnection() {
			return Promise.resolve();
		}

		_query(_connection: unknown, query: Record<string, unknown>) {
			const sql = String(query.sql);

			if (!TRANSACTION_CONTROL.test(sql)) {
				captured.push({ sql, bindings: (query.bindings ?? []) as unknown[] });
			}

			query.response = {
				rows: [DEFAULT_ROW],
				rowCount: 1,
				command: sql.split(" ")[0].toUpperCase(),
			};

			return Promise.resolve(query);
		}
	}

	const db = knex({ client: CaptureClient as unknown as typeof knex.Client });

	return { db, captured };
}
