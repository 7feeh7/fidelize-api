import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import { CreateCustomerController } from "./CreateCustomerController";
import { CreateCustomerUseCase } from "./CreateCustomerUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);

const createReferralUseCase = new CreateReferralUseCase(connection);

const createCustomerUseCase = new CreateCustomerUseCase(
	postgresCustomersRepository,
	createReferralUseCase,
	connection,
);
const createCustomerController = new CreateCustomerController(
	createCustomerUseCase,
);

export { createCustomerController, createCustomerUseCase };
