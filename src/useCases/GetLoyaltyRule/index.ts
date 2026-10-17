import { connection } from "@/database/connection";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { GetLoyaltyRuleController } from "./GetLoyaltyRuleController";
import { GetLoyaltyRuleUseCase } from "./GetLoyaltyRuleUseCase";

const postgresLoyaltyRulesRepository = new PostgresLoyaltyRulesRepository(
	connection,
);

const getLoyaltyRuleUseCase = new GetLoyaltyRuleUseCase(
	postgresLoyaltyRulesRepository,
);
const getLoyaltyRuleController = new GetLoyaltyRuleController(
	getLoyaltyRuleUseCase,
);

export { getLoyaltyRuleController };
