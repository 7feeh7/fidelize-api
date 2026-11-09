import { connection } from "@/database/connection";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { CreateTenantController } from "./CreateTenantController";
import { CreateTenantUseCase } from "./CreateTenantUseCase";

const createTenantUseCase = new CreateTenantUseCase(
	new PostgresTenantsRepository(connection),
	connection,
);
const createTenantController = new CreateTenantController(createTenantUseCase);

export { createTenantController, createTenantUseCase };
