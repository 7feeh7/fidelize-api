import type { Knex } from "knex";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { GrantCustomerRewardsService } from "./GrantCustomerRewardsService";

export function createGrantCustomerRewardsService(
	connection: Knex,
): GrantCustomerRewardsService {
	return new GrantCustomerRewardsService(
		new PostgresLoyaltyRulesRepository(connection),
		new PostgresCustomerRewardsRepository(connection),
	);
}
