import type { Request, Response } from "express";
import type { ListCustomersUseCase } from "./ListCustomersUseCase";

function parsePositiveInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? fallback), 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return fallback;
	}
	return parsed;
}

export class ListCustomersController {
	constructor(private listCustomersUseCase: ListCustomersUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const page = parsePositiveInt(request.query.page, 1);
			const perPage = parsePositiveInt(request.query.perPage, 10);
			const search =
				typeof request.query.search === "string"
					? request.query.search
					: undefined;

			const result = await this.listCustomersUseCase.execute({
				page,
				perPage,
				search,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
