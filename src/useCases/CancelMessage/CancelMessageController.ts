import type { Request, Response } from "express";
import { readRouteParam } from "@/utils/readRouteParam";
import type { CancelMessageUseCase } from "./CancelMessageUseCase";

export class CancelMessageController {
	constructor(private cancelMessageUseCase: CancelMessageUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			await this.cancelMessageUseCase.execute(
				readRouteParam(request.params.id, "id"),
			);

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
