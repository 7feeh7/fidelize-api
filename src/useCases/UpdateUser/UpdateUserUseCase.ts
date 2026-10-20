import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { TOKEN_NOT_PROVIDED_MESSAGE } from "../GetMe/GetMeUseCase";
import type { IUpdateUserRequestDTO } from "./UpdateUserDTO";

const USER_NOT_FOUND_MESSAGE = "Usuário não encontrado";
const FORBIDDEN_MESSAGE = "Você não tem permissão para atualizar este usuário";

export class UpdateUserUseCase {
	constructor(
		private usersRepository: IUsersRepository,
		private tokenProvider: ITokenProvider,
		private hashProvider: IHashProvider,
	) {}

	async execute(data: IUpdateUserRequestDTO): Promise<void> {
		if (!data.accessToken?.trim()) {
			throw new Error(TOKEN_NOT_PROVIDED_MESSAGE);
		}

		const userId = data.userId?.trim();
		if (!userId) {
			throw new Error("Usuário inválido");
		}

		const name = data.name?.trim();
		const email = data.email?.trim().toLowerCase();

		if (!name) {
			throw new Error("Informe o nome");
		}

		if (!email) {
			throw new Error("Informe o e-mail");
		}

		const payload = this.tokenProvider.verifyAccessToken(data.accessToken);

		if (payload.sub !== userId) {
			throw new Error(FORBIDDEN_MESSAGE);
		}

		const user = await this.usersRepository.findById(userId);

		if (!user?.id) {
			throw new Error(USER_NOT_FOUND_MESSAGE);
		}

		if (email !== user.email) {
			const emailInUse = await this.usersRepository.findByEmail(email);
			if (emailInUse && emailInUse.id !== user.id) {
				throw new Error("O usuário já existe");
			}
		}

		user.name = name;
		user.email = email;

		const plainPassword = data.password?.trim();
		if (plainPassword) {
			user.password = await this.hashProvider.generateHash(plainPassword);
		}

		await this.usersRepository.update(user);
	}
}

export { FORBIDDEN_MESSAGE, USER_NOT_FOUND_MESSAGE };
