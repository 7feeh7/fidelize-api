import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import type { ICancelReferralRequestDTO } from "./CancelReferralDTO";

export class CancelReferralUseCase {
	constructor(private referralsRepository: IReferralsRepository) {}

	async execute(
		tenantId: string,
		{ id }: ICancelReferralRequestDTO,
	): Promise<void> {
		const referral = await this.referralsRepository.findById(tenantId, id);

		if (!referral) {
			throw new Error("Indicação não encontrada");
		}

		if (referral.status !== "PENDING") {
			throw new Error("Somente indicações pendentes podem ser canceladas");
		}

		referral.status = "CANCELED";
		await this.referralsRepository.update(tenantId, referral);
	}
}
