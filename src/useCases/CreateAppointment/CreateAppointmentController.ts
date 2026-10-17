import type { Request, Response } from "express";
import type { CreateAppointmentUseCase } from "./CreateAppointmentUseCase";

export class CreateAppointmentController {
	constructor(private createAppointmentUseCase: CreateAppointmentUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const {
				customerId,
				appointmentDate,
				loggedUserId,
				userId,
				discountAmount,
				customerRewardId,
				notes,
				items,
			} = request.body;

			const { grantedRewards } = await this.createAppointmentUseCase.execute({
				customerId,
				appointmentDate,
				loggedUserId,
				userId,
				discountAmount,
				customerRewardId,
				notes,
				items,
			});

			return response.status(201).json({ grantedRewards });
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
