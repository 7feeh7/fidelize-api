import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { BuildMessageTemplateVariableValuesService } from "./BuildMessageTemplateVariableValuesService";
import { FillMessageTemplateService } from "./FillMessageTemplateService";

export function createFillMessageTemplateService(): FillMessageTemplateService {
	const buildVariableValuesService =
		new BuildMessageTemplateVariableValuesService(
			new PostgresCustomersRepository(connection),
			new PostgresAppointmentsRepository(connection),
			new PostgresCustomerRewardsRepository(connection),
			new PostgresTenantsRepository(connection),
		);

	return new FillMessageTemplateService(buildVariableValuesService);
}
