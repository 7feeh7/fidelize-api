import type { Request, Response } from "express";
import type { CustomerRewardStatus } from "@/entities/CustomerReward";
import type { ListCustomerRewardsUseCase } from "./ListCustomerRewardsUseCase";

function parsePositiveInt(value: unknown, fallback: number): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return fallback;
	}

	return Math.floor(parsed);
}

export class ListCustomerRewardsController {
	constructor(private listCustomerRewardsUseCase: ListCustomerRewardsUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { customerId } = request.params;
			const status = request.query.status as CustomerRewardStatus | undefined;

			const result = await this.listCustomerRewardsUseCase.execute({
				customerId,
				status,
				page:
					typeof request.query.page === "string"
						? parsePositiveInt(request.query.page, 1)
						: undefined,
				perPage:
					typeof request.query.perPage === "string"
						? parsePositiveInt(request.query.perPage, 10)
						: undefined,
			});

			return response.json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
