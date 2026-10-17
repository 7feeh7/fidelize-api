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
				notes,
				items,
			} = request.body;

			await this.createAppointmentUseCase.execute({
				customerId,
				appointmentDate,
				loggedUserId,
				userId,
				discountAmount,
				notes,
				items,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
