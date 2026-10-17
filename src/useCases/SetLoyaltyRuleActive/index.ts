import { connection } from "@/database/connection";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { SetLoyaltyRuleActiveController } from "./SetLoyaltyRuleActiveController";
import { SetLoyaltyRuleActiveUseCase } from "./SetLoyaltyRuleActiveUseCase";

const postgresLoyaltyRulesRepository = new PostgresLoyaltyRulesRepository(
	connection,
);

const setLoyaltyRuleActiveUseCase = new SetLoyaltyRuleActiveUseCase(
	postgresLoyaltyRulesRepository,
);
const setLoyaltyRuleActiveController = new SetLoyaltyRuleActiveController(
	setLoyaltyRuleActiveUseCase,
);

export { setLoyaltyRuleActiveController };
