import { connection } from "@/database/connection";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { CreateLoyaltyRuleController } from "./CreateLoyaltyRuleController";
import { CreateLoyaltyRuleUseCase } from "./CreateLoyaltyRuleUseCase";

const postgresLoyaltyRulesRepository = new PostgresLoyaltyRulesRepository(
	connection,
);
const postgresServicesRepository = new PostgresServicesRepository(connection);

const createLoyaltyRuleUseCase = new CreateLoyaltyRuleUseCase(
	postgresLoyaltyRulesRepository,
	postgresServicesRepository,
);
const createLoyaltyRuleController = new CreateLoyaltyRuleController(
	createLoyaltyRuleUseCase,
);

export { createLoyaltyRuleController };
