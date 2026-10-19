import type { Knex } from "knex";

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
		...(isDbSslEnabled() ? { ssl: { rejectUnauthorized: false } } : {}),
	},
	...(isLambdaEnvironment()
		? {
				pool: {
					min: 0,
					max: 1,
				},
			}
		: {}),
	migrations: {
		directory: "./migrations",
		extension: "ts",
	},
};

export default config;
