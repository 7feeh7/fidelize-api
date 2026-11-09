import jwt from "jsonwebtoken";
import { tenantHasAccess } from "@/entities/Tenant";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type {
	IAuthenticateUserRequestDTO,
	IAuthenticateUserResponseDTO,
} from "./AuthenticateUserDTO";

const INVALID_CREDENTIALS_MESSAGE = "Credenciais inválidas";
export const TENANT_WITHOUT_ACCESS_MESSAGE =
	"Este negócio está sem acesso ao sistema";

export class AuthenticateUserUseCase {
	constructor(
		private userRepository: IUsersRepository,
		private hashProvider: IHashProvider,
		private tokenProvider: ITokenProvider,
		private tenantsRepository: ITenantsRepository,
	) {}

	async execute(
		data: IAuthenticateUserRequestDTO,
	): Promise<IAuthenticateUserResponseDTO> {
		const user = await this.userRepository.findByEmail(data.email);

		if (!user) {
			throw new Error(INVALID_CREDENTIALS_MESSAGE);
		}

		const passwordMatches = await this.hashProvider.compareHash(
			data.password,
			user.password,
		);

		if (!passwordMatches) {
			throw new Error(INVALID_CREDENTIALS_MESSAGE);
		}

		if (!user.id) {
			throw new Error(INVALID_CREDENTIALS_MESSAGE);
		}

		const tenant = await this.tenantsRepository.findById(user.tenantId);

		if (!tenant || !tenantHasAccess(tenant.status)) {
			throw new Error(TENANT_WITHOUT_ACCESS_MESSAGE);
		}

		if (!user.firstLoginAt) {
			await this.userRepository.markFirstLogin(user.tenantId, user.id);
		}

		const tokenPayload = {
			sub: user.id,
			email: user.email,
			tenantId: user.tenantId,
			role: user.role,
		};

		const access_token = this.tokenProvider.generateAccessToken(tokenPayload);
		const refresh_token = this.tokenProvider.generateRefreshToken(tokenPayload);

		const decoded = jwt.decode(access_token) as jwt.JwtPayload | null;
		if (
			decoded?.exp == null ||
			decoded.iat == null ||
			typeof decoded.exp !== "number" ||
			typeof decoded.iat !== "number"
		) {
			throw new Error("Token inválido");
		}
		const expires_in = decoded.exp - decoded.iat;

		return {
			access_token,
			refresh_token,
			expires_in,
		};
	}
}
