import type { Request, Response } from "express";
import type { ListLoyaltyRulesUseCase } from "./ListLoyaltyRulesUseCase";

export class ListLoyaltyRulesController {
	constructor(private listLoyaltyRulesUseCase: ListLoyaltyRulesUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const data = await this.listLoyaltyRulesUseCase.execute(
				request.auth.tenantId,
			);

			return response.status(200).json(data);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
