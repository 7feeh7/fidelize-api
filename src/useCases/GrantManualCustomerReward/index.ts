import { connection } from "@/database/connection";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { createGrantCustomerRewardsService } from "@/services/createGrantCustomerRewardsService";
import { GrantManualCustomerRewardController } from "./GrantManualCustomerRewardController";
import { GrantManualCustomerRewardUseCase } from "./GrantManualCustomerRewardUseCase";

const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);
const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const grantCustomerRewardsService =
	createGrantCustomerRewardsService(connection);

const grantManualCustomerRewardUseCase = new GrantManualCustomerRewardUseCase(
	postgresCustomersRepository,
	postgresCustomerRewardsRepository,
	grantCustomerRewardsService,
);
const grantManualCustomerRewardController =
	new GrantManualCustomerRewardController(grantManualCustomerRewardUseCase);

export {
	grantManualCustomerRewardController,
	grantManualCustomerRewardUseCase,
};
