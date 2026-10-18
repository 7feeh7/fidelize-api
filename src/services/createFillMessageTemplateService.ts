import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { BuildMessageTemplateVariableValuesService } from "./BuildMessageTemplateVariableValuesService";
import { FillMessageTemplateService } from "./FillMessageTemplateService";

export function createFillMessageTemplateService(): FillMessageTemplateService {
	const buildVariableValuesService =
		new BuildMessageTemplateVariableValuesService(
			new PostgresCustomersRepository(connection),
			new PostgresAppointmentsRepository(connection),
			new PostgresCustomerRewardsRepository(connection),
		);

	return new FillMessageTemplateService(buildVariableValuesService);
}
