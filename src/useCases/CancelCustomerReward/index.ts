import { connection } from "@/database/connection";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { CancelCustomerRewardController } from "./CancelCustomerRewardController";
import { CancelCustomerRewardUseCase } from "./CancelCustomerRewardUseCase";

const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);
const postgresCustomersRepository = new PostgresCustomersRepository(connection);

const cancelCustomerRewardUseCase = new CancelCustomerRewardUseCase(
	postgresCustomerRewardsRepository,
	postgresCustomersRepository,
);
const cancelCustomerRewardController = new CancelCustomerRewardController(
	cancelCustomerRewardUseCase,
);

export { cancelCustomerRewardController, cancelCustomerRewardUseCase };
