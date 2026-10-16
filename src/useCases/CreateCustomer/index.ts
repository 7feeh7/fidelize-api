import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { CreateCustomerController } from "./CreateCustomerController";
import { CreateCustomerUseCase } from "./CreateCustomerUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);

const createCustomerUseCase = new CreateCustomerUseCase(
	postgresCustomersRepository,
);
const createCustomerController = new CreateCustomerController(
	createCustomerUseCase,
);

export { createCustomerController, createCustomerUseCase };
