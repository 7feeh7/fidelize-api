import { connection } from "@/database/connection";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { CreateServiceController } from "./CreateServiceController";
import { CreateServiceUseCase } from "./CreateServiceUseCase";

const postgresServicesRepository = new PostgresServicesRepository(connection);

const createServiceUseCase = new CreateServiceUseCase(postgresServicesRepository);
const createServiceController = new CreateServiceController(createServiceUseCase);

export { createServiceController, createServiceUseCase };
