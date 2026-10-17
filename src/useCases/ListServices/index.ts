import { connection } from "@/database/connection";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { ListServicesController } from "./ListServicesController";
import { ListServicesUseCase } from "./ListServicesUseCase";

const postgresServicesRepository = new PostgresServicesRepository(connection);

const listServicesUseCase = new ListServicesUseCase(postgresServicesRepository);
const listServicesController = new ListServicesController(listServicesUseCase);

export { listServicesController, listServicesUseCase };
