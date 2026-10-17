import type { Knex } from "knex";
import { Referral } from "@/entities/Referral";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { createGrantCustomerRewardsService } from "@/services/createGrantCustomerRewardsService";
import type { GrantedRewardDTO } from "@/services/GrantCustomerRewardsService";
import type { ICreateReferralRequestDTO } from "./CreateReferralDTO";

export interface ICreateReferralResponseDTO {
	grantedRewards: GrantedRewardDTO[];
}

export class CreateReferralUseCase {
	constructor(private connection: Knex) {}

	async execute(
		data: ICreateReferralRequestDTO,
		trx?: Knex.Transaction,
	): Promise<ICreateReferralResponseDTO> {
		const run = async (
			transaction: Knex.Transaction,
		): Promise<GrantedRewardDTO[]> => {
			const referralsRepository = new PostgresReferralsRepository(transaction);
			const customersRepository = new PostgresCustomersRepository(transaction);

			const referrerId = data.referrerId?.trim();
			const referredId = data.referredId?.trim();

			if (!referrerId) {
				throw new Error("Informe quem indicou o cliente");
			}

			if (!referredId) {
				throw new Error("Informe o cliente indicado");
			}

			if (referrerId === referredId) {
				throw new Error("Indicador e indicado devem ser clientes diferentes");
			}

			const existingReferral =
				await referralsRepository.findByReferredId(referredId);

			if (existingReferral) {
				throw new Error("Este cliente já foi indicado");
			}

			const referrer = await customersRepository.findActiveById(referrerId);

			if (!referrer) {
				throw new Error("Indicador não encontrado");
			}

			const referred = await customersRepository.findActiveById(referredId);

			if (!referred) {
				throw new Error("Cliente indicado não encontrado");
			}

			const referral = new Referral({
				referrerId,
				referredId,
				status: "PENDING",
				convertedAt: null,
			});

			await referralsRepository.save(referral);

			const grantService = createGrantCustomerRewardsService(transaction);
			return grantService.grantForNewReferral(referral);
		};

		if (trx) {
			return { grantedRewards: await run(trx) };
		}

		const grantedRewards = await this.connection.transaction(run);
		return { grantedRewards };
	}
}
