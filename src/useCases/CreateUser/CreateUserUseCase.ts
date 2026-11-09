import { USER_ROLES, User } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type { ICreateUserRequestDTO } from "./CreateUserDTO";

export class CreateUserUseCase {
	constructor(
		private userRepository: IUsersRepository,
		private hashProvider: IHashProvider,
		private tenantsRepository: ITenantsRepository,
	) {}

	// Única rota em que o negócio vem do corpo: é restrita a PLATFORM_ADMIN em routes.ts.
	async execute(data: ICreateUserRequestDTO) {
		if (!USER_ROLES.includes(data.role)) {
			throw new Error("Papel de usuário inválido");
		}

		const tenantId = data.tenantId?.trim();
		const tenant = tenantId
			? await this.tenantsRepository.findById(tenantId)
			: null;

		if (!tenant) {
			throw new Error("Negócio não encontrado");
		}

		const userAlreadyExists = await this.userRepository.findByEmail(data.email);
		if (userAlreadyExists) {
			throw new Error("O usuário já existe");
		}

		const hashedPassword = await this.hashProvider.generateHash(data.password);

		const user = new User({
			tenantId: tenant.id as string,
			role: data.role,
			name: data.name,
			email: data.email,
			password: hashedPassword,
			firstLoginAt: null,
		});
		await this.userRepository.save(user);
	}
}
