import type { Request, Response } from "express";
import type { ListOverdueReturnsUseCase } from "./ListOverdueReturnsUseCase";

function parsePositiveInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? fallback), 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return fallback;
	}
	return parsed;
}

export class ListOverdueReturnsController {
	constructor(private listOverdueReturnsUseCase: ListOverdueReturnsUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.listOverdueReturnsUseCase.execute({
				page: parsePositiveInt(request.query.page, 1),
				perPage: parsePositiveInt(request.query.perPage, 5),
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
