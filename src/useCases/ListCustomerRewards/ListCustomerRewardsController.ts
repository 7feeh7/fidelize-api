import type { Request, Response } from "express";
import type { CustomerRewardStatus } from "@/entities/CustomerReward";
import type { ListCustomerRewardsUseCase } from "./ListCustomerRewardsUseCase";

export class ListCustomerRewardsController {
	constructor(
		private listCustomerRewardsUseCase: ListCustomerRewardsUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { customerId } = request.params;
			const status = request.query.status as CustomerRewardStatus | undefined;

			const result = await this.listCustomerRewardsUseCase.execute({
				customerId,
				status,
			});

			return response.json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
