import type { Request, Response } from "express";
import type { ListServicesUseCase } from "./ListServicesUseCase";

export class ListServicesController {
	constructor(private listServicesUseCase: ListServicesUseCase) {}

	async handle(_request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.listServicesUseCase.execute();

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
