import type { Request, Response } from "express";
import { readBearerToken } from "@/utils/readBearerToken";
import { readRouteParam } from "@/utils/readRouteParam";
import { TOKEN_NOT_PROVIDED_MESSAGE } from "../GetMe/GetMeUseCase";
import type { UpdateUserUseCase } from "./UpdateUserUseCase";
import { FORBIDDEN_MESSAGE, USER_NOT_FOUND_MESSAGE } from "./UpdateUserUseCase";

const INVALID_TOKEN_MESSAGE = "Token inválido";

export class UpdateUserController {
	constructor(private updateUserUseCase: UpdateUserUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const accessToken = readBearerToken(request.headers.authorization);
			const { name, email, password } = request.body;

			await this.updateUserUseCase.execute({
				accessToken,
				userId: readRouteParam(request.params.id, "id"),
				name,
				email,
				password,
			});

			return response.status(204).send();
		} catch (err: unknown) {
			const message = (err as Error).message || "Unexpected error";

			if (
				message === TOKEN_NOT_PROVIDED_MESSAGE ||
				message === INVALID_TOKEN_MESSAGE
			) {
				return response.status(401).json({ message });
			}

			if (message === FORBIDDEN_MESSAGE) {
				return response.status(403).json({ message });
			}

			if (message === USER_NOT_FOUND_MESSAGE) {
				return response.status(404).json({ message });
			}

			return response.status(400).json({ message });
		}
	}
}
