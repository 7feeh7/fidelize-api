import type { IIndicatorsRepository } from "@/repositories/IIndicatorsRepository";
import { resolveIndicatorsDateRange } from "@/utils/resolveIndicatorsDateRange";
import type {
	IGetIndicatorsRequestDTO,
	IGetIndicatorsResponseDTO,
} from "./GetIndicatorsDTO";

export class GetIndicatorsUseCase {
	constructor(private indicatorsRepository: IIndicatorsRepository) {}

	async execute(
		tenantId: string,
		data: IGetIndicatorsRequestDTO = {},
	): Promise<IGetIndicatorsResponseDTO> {
		const { startDate, endDate } = resolveIndicatorsDateRange(data);

		const totals = await this.indicatorsRepository.getTotals(
			tenantId,
			startDate,
			endDate,
		);

		return {
			startDate,
			endDate,
			...totals,
		};
	}
}
