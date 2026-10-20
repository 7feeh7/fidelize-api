import type { Knex } from "knex";

const DB_CONNECT_TIMEOUT_MS = 5_000;
const DB_ACQUIRE_CONNECTION_TIMEOUT_MS = 10_000;
const DB_QUERY_TIMEOUT_MS = 25_000;

function isDbSslEnabled(): boolean {
	const value = process.env.DB_SSL?.trim().toLowerCase();

	return value === "true" || value === "1";
}

function isLambdaEnvironment(): boolean {
	return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

const config: Knex.Config = {
	client: "pg",
	connection: {
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		connectionTimeoutMillis: DB_CONNECT_TIMEOUT_MS,
		query_timeout: DB_QUERY_TIMEOUT_MS,
		application_name: "fidelizei-api",
		...(isDbSslEnabled() ? { ssl: { rejectUnauthorized: false } } : {}),
	},
	acquireConnectionTimeout: DB_ACQUIRE_CONNECTION_TIMEOUT_MS,
	pool: isLambdaEnvironment()
		? {
				min: 0,
				max: 1,
			}
		: {
				min: 0,
				max: 10,
			},
	migrations: {
		directory: "./migrations",
		extension: "ts",
	},
};

export default config;
