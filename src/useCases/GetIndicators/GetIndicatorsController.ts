import type { Request, Response } from "express";
import type { GetIndicatorsUseCase } from "./GetIndicatorsUseCase";

function parseOptionalDate(value: unknown): string | undefined {
	if (typeof value !== "string" || value.trim() === "") {
		return undefined;
	}

	return value.trim();
}

export class GetIndicatorsController {
	constructor(private getIndicatorsUseCase: GetIndicatorsUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.getIndicatorsUseCase.execute({
				startDate: parseOptionalDate(request.query.startDate),
				endDate: parseOptionalDate(request.query.endDate),
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
