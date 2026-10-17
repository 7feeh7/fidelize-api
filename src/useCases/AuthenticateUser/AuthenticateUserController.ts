import type { Request, Response } from "express";
import type { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

const INVALID_CREDENTIALS_MESSAGE = "Credenciais inválidas";

export class AuthenticateUserController {
	constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { email, password } = request.body;

			if (!email || !password) {
				return response.status(400).json({
					message: "E-mail e senha são obrigatórios",
				});
			}

			const result = await this.authenticateUserUseCase.execute({
				email,
				password,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			const message = (err as Error).message || "Unexpected error";

			if (message === INVALID_CREDENTIALS_MESSAGE) {
				return response.status(401).json({ message });
			}

			return response.status(400).json({ message });
		}
	}
}
