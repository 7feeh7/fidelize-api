import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { DeactivateCustomerController } from "./DeactivateCustomerController";
import { DeactivateCustomerUseCase } from "./DeactivateCustomerUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);

const deactivateCustomerUseCase = new DeactivateCustomerUseCase(
	postgresCustomersRepository,
);
const deactivateCustomerController = new DeactivateCustomerController(
	deactivateCustomerUseCase,
);

export { deactivateCustomerController, deactivateCustomerUseCase };
