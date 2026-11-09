import type { Knex } from "knex";
import type { Tenant } from "@/entities/Tenant";
import { logger } from "@/providers/implementations/PinoLogger";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";
import { generateBirthdaysStep } from "./generateBirthdaysStep";
import { generateReturnRemindersStep } from "./generateReturnRemindersStep";

export interface TenantDailyRoutineResult {
	tenantId: string;
	expireCustomerRewards: Awaited<ReturnType<typeof expireCustomerRewardsStep>>;
	returnReminders: Awaited<ReturnType<typeof generateReturnRemindersStep>>;
	birthdays: Awaited<ReturnType<typeof generateBirthdaysStep>>;
}

export interface DailyRoutineResult {
	tenants: TenantDailyRoutineResult[];
	failedTenantIds: string[];
}

async function runTenantDailyRoutine(
	connection: Knex,
	tenant: Tenant,
): Promise<TenantDailyRoutineResult> {
	const tenantId = tenant.id as string;
	const expireCustomerRewards = await expireCustomerRewardsStep(
		connection,
		tenant,
	);
	const returnReminders = await generateReturnRemindersStep(connection, tenant);
	const birthdays = await generateBirthdaysStep(connection, tenant);

	logger.info(
		{
			tenantId,
			step: "expire-customer-rewards",
			expiredCount: expireCustomerRewards.expiredCount,
			executedAt: expireCustomerRewards.executedAt.toISOString(),
		},
		"Beneficios expirados na rotina diaria",
	);

	logger.info(
		{
			tenantId,
			step: "return-reminders",
			generatedCount: returnReminders.generatedCount,
			executedAt: returnReminders.executedAt.toISOString(),
		},
		"Lembretes de retorno gerados na rotina diaria",
	);

	logger.info(
		{
			tenantId,
			step: "birthdays",
			generatedCount: birthdays.generatedCount,
			grantedCount: birthdays.grantedCount,
			executedAt: birthdays.executedAt.toISOString(),
		},
		"Aniversarios processados na rotina diaria",
	);

	return { tenantId, expireCustomerRewards, returnReminders, birthdays };
}

export async function runDailyRoutine(
	connection: Knex,
): Promise<DailyRoutineResult> {
	const tenantsRepository = new PostgresTenantsRepository(connection);
	const tenants = await tenantsRepository.listWithAccess();
	const results: TenantDailyRoutineResult[] = [];
	const failedTenantIds: string[] = [];

	for (const tenant of tenants) {
		try {
			results.push(await runTenantDailyRoutine(connection, tenant));
		} catch (error) {
			failedTenantIds.push(tenant.id as string);
			logger.error(
				{ err: error, tenantId: tenant.id },
				"Falha na rotina diaria do negocio",
			);
		}
	}

	// Mantém a invocação marcada como erro, depois de tentar todos os negócios.
	if (failedTenantIds.length > 0) {
		throw new Error(
			`Rotina diária falhou em ${failedTenantIds.length} de ${tenants.length} negócios`,
		);
	}

	return { tenants: results, failedTenantIds };
}
