import { Referral } from "@/entities/Referral";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import type { ICreateReferralRequestDTO } from "./CreateReferralDTO";

export class CreateReferralUseCase {
	constructor(
		private referralsRepository: IReferralsRepository,
		private customersRepository: ICustomersRepository,
	) {}

	async execute(data: ICreateReferralRequestDTO): Promise<void> {
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
			await this.referralsRepository.findByReferredId(referredId);

		if (existingReferral) {
			throw new Error("Este cliente já foi indicado");
		}

		const referrer = await this.customersRepository.findActiveById(referrerId);

		if (!referrer) {
			throw new Error("Indicador não encontrado");
		}

		const referred = await this.customersRepository.findActiveById(referredId);

		if (!referred) {
			throw new Error("Cliente indicado não encontrado");
		}

		const referral = new Referral({
			referrerId,
			referredId,
			status: "PENDING",
			convertedAt: null,
		});

		await this.referralsRepository.save(referral);
	}
}
