import type { Request, Response } from "express";
import { readBearerToken } from "@/utils/readBearerToken";
import type { GetMeUseCase } from "./GetMeUseCase";
import {
	TOKEN_NOT_PROVIDED_MESSAGE,
	USER_NOT_FOUND_MESSAGE,
} from "./GetMeUseCase";

const INVALID_TOKEN_MESSAGE = "Token inválido";

export class GetMeController {
	constructor(private getMeUseCase: GetMeUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const accessToken = readBearerToken(request.headers.authorization);
			const result = await this.getMeUseCase.execute(accessToken);
			return response.status(200).json(result);
		} catch (err: unknown) {
			const message = (err as Error).message || "Unexpected error";

			if (
				message === TOKEN_NOT_PROVIDED_MESSAGE ||
				message === INVALID_TOKEN_MESSAGE
			) {
				return response.status(401).json({ message });
			}

			if (message === USER_NOT_FOUND_MESSAGE) {
				return response.status(404).json({ message });
			}

			return response.status(400).json({ message });
		}
	}
}
