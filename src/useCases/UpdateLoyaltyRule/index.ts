import { connection } from "@/database/connection";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { UpdateLoyaltyRuleController } from "./UpdateLoyaltyRuleController";
import { UpdateLoyaltyRuleUseCase } from "./UpdateLoyaltyRuleUseCase";

const postgresLoyaltyRulesRepository = new PostgresLoyaltyRulesRepository(
	connection,
);
const postgresServicesRepository = new PostgresServicesRepository(connection);

const updateLoyaltyRuleUseCase = new UpdateLoyaltyRuleUseCase(
	postgresLoyaltyRulesRepository,
	postgresServicesRepository,
);
const updateLoyaltyRuleController = new UpdateLoyaltyRuleController(
	updateLoyaltyRuleUseCase,
);

export { updateLoyaltyRuleController };
