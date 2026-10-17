import type { Request, Response } from "express";
import type { ListMonthlyBirthdaysUseCase } from "./ListMonthlyBirthdaysUseCase";

function parseOptionalInteger(value: unknown): number | undefined {
	if (typeof value !== "string" || value.trim() === "") {
		return undefined;
	}

	const parsed = Number(value);

	if (!Number.isInteger(parsed)) {
		return undefined;
	}

	return parsed;
}

export class ListMonthlyBirthdaysController {
	constructor(
		private listMonthlyBirthdaysUseCase: ListMonthlyBirthdaysUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.listMonthlyBirthdaysUseCase.execute({
				year: parseOptionalInteger(request.query.year),
				month: parseOptionalInteger(request.query.month),
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
