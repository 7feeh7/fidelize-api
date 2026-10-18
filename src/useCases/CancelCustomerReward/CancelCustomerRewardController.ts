import type { Request, Response } from "express";
import { readRouteParam } from "@/utils/readRouteParam";
import type { CancelCustomerRewardUseCase } from "./CancelCustomerRewardUseCase";

export class CancelCustomerRewardController {
	constructor(
		private cancelCustomerRewardUseCase: CancelCustomerRewardUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			await this.cancelCustomerRewardUseCase.execute({
				customerId: readRouteParam(request.params.customerId, "customerId"),
				rewardId: readRouteParam(request.params.rewardId, "rewardId"),
			});

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
