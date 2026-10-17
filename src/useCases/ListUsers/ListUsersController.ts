import type { Request, Response } from "express";
import type { ListUsersUseCase } from "./ListUsersUseCase";

export class ListUsersController {
	constructor(private listUsersUseCase: ListUsersUseCase) {}

	async handle(_request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.listUsersUseCase.execute();

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
