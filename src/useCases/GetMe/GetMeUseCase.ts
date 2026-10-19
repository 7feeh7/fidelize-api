import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type { IGetMeResponseDTO } from "./GetMeDTO";

const TOKEN_NOT_PROVIDED_MESSAGE = "Token não informado";
const USER_NOT_FOUND_MESSAGE = "Usuário não encontrado";

export class GetMeUseCase {
	constructor(
		private usersRepository: IUsersRepository,
		private tokenProvider: ITokenProvider,
	) {}

	async execute(accessToken: string): Promise<IGetMeResponseDTO> {
		if (!accessToken?.trim()) {
			throw new Error(TOKEN_NOT_PROVIDED_MESSAGE);
		}

		const payload = this.tokenProvider.verifyAccessToken(accessToken);
		const user = await this.usersRepository.findById(payload.sub);

		if (!user?.id) {
			throw new Error(USER_NOT_FOUND_MESSAGE);
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
		};
	}
}

export { TOKEN_NOT_PROVIDED_MESSAGE, USER_NOT_FOUND_MESSAGE };
