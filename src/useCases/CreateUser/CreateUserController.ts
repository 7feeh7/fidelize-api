import type { Request, Response } from "express";
import type { CreateUserUseCase } from "./CreateUserUseCase";

export class CreateUserController {
	constructor(private createUserUseCase: CreateUserUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { name, email, password } = request.body;

			await this.createUserUseCase.execute({
				name,
				email,
				password,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
