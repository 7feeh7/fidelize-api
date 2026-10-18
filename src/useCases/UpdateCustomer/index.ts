import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import { UpdateCustomerController } from "./UpdateCustomerController";
import { UpdateCustomerUseCase } from "./UpdateCustomerUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresReferralsRepository = new PostgresReferralsRepository(connection);

const createReferralUseCase = new CreateReferralUseCase(connection);

const updateCustomerUseCase = new UpdateCustomerUseCase(
	postgresCustomersRepository,
	postgresReferralsRepository,
	createReferralUseCase,
);
const updateCustomerController = new UpdateCustomerController(
	updateCustomerUseCase,
);

export { updateCustomerController, updateCustomerUseCase };
