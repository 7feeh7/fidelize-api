import type { Request, Response } from "express";
import type { UpdateAppointmentUseCase } from "./UpdateAppointmentUseCase";

export class UpdateAppointmentController {
	constructor(private updateAppointmentUseCase: UpdateAppointmentUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;
			const {
				customerId,
				appointmentDate,
				loggedUserId,
				userId,
				discountAmount,
				notes,
				items,
			} = request.body;

			await this.updateAppointmentUseCase.execute({
				id,
				customerId,
				appointmentDate,
				loggedUserId,
				userId,
				discountAmount,
				notes,
				items,
			});

			return response.status(200).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
