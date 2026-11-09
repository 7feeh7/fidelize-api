import type { Knex } from "knex";
import { DEFAULT_MESSAGE_TEMPLATES } from "@/config/defaultMessageTemplates";
import { MessageTemplate } from "@/entities/MessageTemplate";
import { Tenant } from "@/entities/Tenant";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { isPostgresUniqueViolation } from "@/utils/isPostgresUniqueViolation";
import type {
	ICreateTenantRequestDTO,
	ICreateTenantResponseDTO,
} from "./CreateTenantDTO";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 60;
const SLUG_IN_USE_MESSAGE = "O slug já está em uso";

export class CreateTenantUseCase {
	constructor(
		private tenantsRepository: ITenantsRepository,
		private connection: Knex,
	) {}

	async execute(
		data: ICreateTenantRequestDTO,
	): Promise<ICreateTenantResponseDTO> {
		const name = data.name?.trim();
		const slug = data.slug?.trim();

		if (!name || name.length > MAX_NAME_LENGTH) {
			throw new Error("Nome do negócio inválido");
		}

		if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
			throw new Error("Slug inválido: use letras minúsculas, números e hífens");
		}

		if (await this.tenantsRepository.findBySlug(slug)) {
			throw new Error(SLUG_IN_USE_MESSAGE);
		}

		const tenant = new Tenant({ name, slug, status: "TRIAL" });
		const tenantId = tenant.id as string;

		try {
			await this.connection.transaction(async (trx) => {
				const tenantsRepository = new PostgresTenantsRepository(trx);
				const templatesRepository = new PostgresMessageTemplatesRepository(trx);

				await tenantsRepository.save(tenant);

				for (const template of DEFAULT_MESSAGE_TEMPLATES) {
					await templatesRepository.save(
						tenantId,
						new MessageTemplate({ ...template, active: true }),
					);
				}
			});
		} catch (error) {
			if (isPostgresUniqueViolation(error)) {
				throw new Error(SLUG_IN_USE_MESSAGE);
			}

			throw error;
		}

		return { id: tenantId };
	}
}
