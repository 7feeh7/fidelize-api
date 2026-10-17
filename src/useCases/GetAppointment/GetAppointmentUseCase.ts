import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import { mapCustomerRewardToDTO } from "@/utils/mapCustomerRewardToDTO";
import type {
	IGetAppointmentRequestDTO,
	IGetAppointmentResponseDTO,
} from "./GetAppointmentDTO";

export class GetAppointmentUseCase {
	constructor(
		private appointmentsRepository: IAppointmentsRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
	) {}

	async execute(
		data: IGetAppointmentRequestDTO,
	): Promise<IGetAppointmentResponseDTO> {
		const appointment = await this.appointmentsRepository.findDetailById(
			data.id,
		);

		if (!appointment) {
			throw new Error("Atendimento não encontrado");
		}

		const usedRewardDetail =
			await this.customerRewardsRepository.findUsedDetailByAppointmentId(
				data.id,
			);
		const usedReward = usedRewardDetail
			? mapCustomerRewardToDTO(usedRewardDetail)
			: null;

		return {
			id: appointment.id,
			customerId: appointment.customerId,
			customerName: appointment.customerName,
			userId: appointment.userId,
			userName: appointment.userName,
			appointmentDate: appointment.appointmentDate.toISOString(),
			subtotal: appointment.subtotal,
			discountAmount: appointment.discountAmount,
			total: appointment.total,
			notes: appointment.notes,
			usedReward: usedReward
				? {
						id: usedReward.id,
						ruleName: usedReward.ruleName,
						rewardType: usedReward.rewardType,
						rewardValue: usedReward.rewardValue,
						freeServiceId: usedReward.freeServiceId,
						rewardSummary: usedReward.rewardSummary,
						preview: usedReward.preview,
					}
				: null,
			items: appointment.items,
		};
	}
}
