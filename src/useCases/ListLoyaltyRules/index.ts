import { connection } from "@/database/connection";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { ListLoyaltyRulesController } from "./ListLoyaltyRulesController";
import { ListLoyaltyRulesUseCase } from "./ListLoyaltyRulesUseCase";

const postgresLoyaltyRulesRepository = new PostgresLoyaltyRulesRepository(
	connection,
);

const listLoyaltyRulesUseCase = new ListLoyaltyRulesUseCase(
	postgresLoyaltyRulesRepository,
);
const listLoyaltyRulesController = new ListLoyaltyRulesController(
	listLoyaltyRulesUseCase,
);

export { listLoyaltyRulesController };
