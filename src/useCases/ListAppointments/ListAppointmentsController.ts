import type { Request, Response } from "express";
import type { ListAppointmentsUseCase } from "./ListAppointmentsUseCase";

function parsePositiveInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? fallback), 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return fallback;
	}
	return parsed;
}

export class ListAppointmentsController {
	constructor(private listAppointmentsUseCase: ListAppointmentsUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const page = parsePositiveInt(request.query.page, 1);
			const perPage = parsePositiveInt(request.query.perPage, 10);
			const customerId =
				typeof request.query.customerId === "string"
					? request.query.customerId
					: undefined;
			const startDate =
				typeof request.query.startDate === "string"
					? request.query.startDate
					: undefined;
			const endDate =
				typeof request.query.endDate === "string"
					? request.query.endDate
					: undefined;

			const result = await this.listAppointmentsUseCase.execute({
				page,
				perPage,
				customerId,
				startDate,
				endDate,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
