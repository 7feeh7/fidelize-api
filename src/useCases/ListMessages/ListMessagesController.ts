import type { MessageStatus } from "@/entities/Message";
import type { MessageTemplateType } from "@/entities/MessageTemplate";
import type { Request, Response } from "express";
import type { ListMessagesUseCase } from "./ListMessagesUseCase";

export class ListMessagesController {
	constructor(private listMessagesUseCase: ListMessagesUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { status, type, customerId, scheduledUntil, scheduledFrom } =
				request.query;

			const result = await this.listMessagesUseCase.execute({
				status:
					typeof status === "string"
						? (status as MessageStatus)
						: undefined,
				type:
					typeof type === "string"
						? (type as MessageTemplateType)
						: undefined,
				customerId: typeof customerId === "string" ? customerId : undefined,
				scheduledUntil:
					typeof scheduledUntil === "string" ? scheduledUntil : undefined,
				scheduledFrom:
					typeof scheduledFrom === "string" ? scheduledFrom : undefined,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
