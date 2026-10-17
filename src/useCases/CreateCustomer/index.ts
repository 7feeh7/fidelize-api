import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import { CreateCustomerController } from "./CreateCustomerController";
import { CreateCustomerUseCase } from "./CreateCustomerUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresReferralsRepository = new PostgresReferralsRepository(connection);

const createReferralUseCase = new CreateReferralUseCase(
	postgresReferralsRepository,
	postgresCustomersRepository,
);

const createCustomerUseCase = new CreateCustomerUseCase(
	postgresCustomersRepository,
	createReferralUseCase,
);
const createCustomerController = new CreateCustomerController(
	createCustomerUseCase,
);

export { createCustomerController, createCustomerUseCase };
