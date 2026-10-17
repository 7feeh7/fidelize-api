import { connection } from "@/database/connection";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { DeactivateServiceController } from "./DeactivateServiceController";
import { DeactivateServiceUseCase } from "./DeactivateServiceUseCase";

const postgresServicesRepository = new PostgresServicesRepository(connection);

const deactivateServiceUseCase = new DeactivateServiceUseCase(
	postgresServicesRepository,
);
const deactivateServiceController = new DeactivateServiceController(
	deactivateServiceUseCase,
);

export { deactivateServiceController, deactivateServiceUseCase };
