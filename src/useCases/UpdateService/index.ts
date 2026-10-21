import { connection } from "@/database/connection";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { UpdateServiceController } from "./UpdateServiceController";
import { UpdateServiceUseCase } from "./UpdateServiceUseCase";

const postgresServicesRepository = new PostgresServicesRepository(connection);

const updateServiceUseCase = new UpdateServiceUseCase(
	postgresServicesRepository,
);
const updateServiceController = new UpdateServiceController(
	updateServiceUseCase,
);

export { updateServiceController };
