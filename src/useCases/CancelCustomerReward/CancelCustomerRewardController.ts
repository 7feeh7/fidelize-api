import type { Request, Response } from "express";
import type { CancelCustomerRewardUseCase } from "./CancelCustomerRewardUseCase";

export class CancelCustomerRewardController {
	constructor(
		private cancelCustomerRewardUseCase: CancelCustomerRewardUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { customerId, rewardId } = request.params;

			await this.cancelCustomerRewardUseCase.execute({
				customerId,
				rewardId,
			});

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
