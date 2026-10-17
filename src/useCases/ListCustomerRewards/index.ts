import { connection } from "@/database/connection";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { ListCustomerRewardsController } from "./ListCustomerRewardsController";
import { ListCustomerRewardsUseCase } from "./ListCustomerRewardsUseCase";

const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);
const postgresCustomersRepository = new PostgresCustomersRepository(connection);

const listCustomerRewardsUseCase = new ListCustomerRewardsUseCase(
	postgresCustomerRewardsRepository,
	postgresCustomersRepository,
);
const listCustomerRewardsController = new ListCustomerRewardsController(
	listCustomerRewardsUseCase,
);

export { listCustomerRewardsController, listCustomerRewardsUseCase };
