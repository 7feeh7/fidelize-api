import type { Knex } from "knex";

// O CLI do knex muda o cwd para a pasta deste arquivo, por isso o caminho das migrations é relativo a ela.
const config: Knex.Config = {
	client: "pg",
	connection: {
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	},
	migrations: {
		directory: "./migrations",
		extension: "ts",
	},
};

export default config;
