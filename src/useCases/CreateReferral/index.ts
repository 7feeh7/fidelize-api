import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { CreateReferralController } from "./CreateReferralController";
import { CreateReferralUseCase } from "./CreateReferralUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresReferralsRepository = new PostgresReferralsRepository(connection);

const createReferralUseCase = new CreateReferralUseCase(
	postgresReferralsRepository,
	postgresCustomersRepository,
);
const createReferralController = new CreateReferralController(
	createReferralUseCase,
);

export {
	createReferralController,
	createReferralUseCase,
};
