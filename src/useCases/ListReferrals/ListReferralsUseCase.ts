import { REFERRAL_STATUSES } from "@/entities/Referral";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import type {
	IListReferralsRequestDTO,
	IListReferralsResponseDTO,
} from "./ListReferralsDTO";

export class ListReferralsUseCase {
	constructor(private referralsRepository: IReferralsRepository) {}

	async execute(
		data: IListReferralsRequestDTO,
	): Promise<IListReferralsResponseDTO> {
		if (data.status && !REFERRAL_STATUSES.includes(data.status)) {
			throw new Error("Status de indicação inválido");
		}

		const page = data.page < 1 ? 1 : data.page;
		const perPage = data.perPage < 1 ? 10 : data.perPage;

		const { items, total } = await this.referralsRepository.list({
			page,
			perPage,
			status: data.status,
			referrerId: data.referrerId?.trim() || undefined,
		});

		const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);

		return {
			data: items.map((item) => ({
				id: item.id,
				referrerId: item.referrerId,
				referrerName: item.referrerName,
				referredId: item.referredId,
				referredName: item.referredName,
				status: item.status,
				createdAt: item.createdAt.toISOString(),
				convertedAt: item.convertedAt?.toISOString() ?? null,
			})),
			page,
			totalPages,
		};
	}
}
