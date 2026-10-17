import type { Knex } from "knex";
import { Customer, LEAD_SOURCES } from "@/entities/Customer";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import { createGrantCustomerRewardsService } from "@/services/createGrantCustomerRewardsService";
import type { GrantedRewardDTO } from "@/services/GrantCustomerRewardsService";
import type { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import type { ICreateCustomerRequestDTO } from "./CreateCustomerDTO";

export interface ICreateCustomerResponseDTO {
	grantedRewards: GrantedRewardDTO[];
}

export class CreateCustomerUseCase {
	constructor(
		private customersRepository: ICustomersRepository,
		private createReferralUseCase: CreateReferralUseCase,
		private connection: Knex,
	) {}

	async execute(
		data: ICreateCustomerRequestDTO,
	): Promise<ICreateCustomerResponseDTO> {
		if (!LEAD_SOURCES.includes(data.leadSource)) {
			throw new Error("Origem do lead inválida");
		}

		if (data.leadSource === "INDICACAO" && !data.referrerId?.trim()) {
			throw new Error("Informe quem indicou o cliente");
		}

		const customerAlreadyExists = await this.customersRepository.findByPhone(
			data.phone,
		);
		if (customerAlreadyExists) {
			throw new Error("O cliente já existe");
		}

		const customer = new Customer({
			name: data.name,
			phone: data.phone,
			dateOfBirth: data.dateOfBirth ?? null,
			leadSource: data.leadSource,
		});

		const grantedRewards: GrantedRewardDTO[] = [];

		await this.connection.transaction(async (trx) => {
			const customersRepository = new PostgresCustomersRepository(trx);
			await customersRepository.save(customer);

			if (data.leadSource === "INDICACAO" && data.referrerId?.trim()) {
				const referralResult = await this.createReferralUseCase.execute(
					{
						referrerId: data.referrerId.trim(),
						referredId: customer.id as string,
					},
					trx,
				);
				grantedRewards.push(...referralResult.grantedRewards);
			}

			if (!data.isExistingCustomer) {
				const grantService = createGrantCustomerRewardsService(trx);
				grantedRewards.push(
					...(await grantService.grantFirstVisit(customer.id as string)),
				);
			}
		});

		return { grantedRewards };
	}
}
